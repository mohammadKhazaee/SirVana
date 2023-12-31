const path = require('path')

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const flash = require('connect-flash')
const helmet = require('helmet')
const compression = require('compression')

const router = require('./routes/routes')
const User = require('./models/user')
const Team = require('./models/team')
const Socket = require('./models/socket')

const PORT = process.env.PORT
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/SirVana'
const MONGO_CONNECT_SECRET = process.env.MONGO_CONNECT_SECRET || 'test secret'

const app = express()
// The store that sessions will be store there
const store = new MongoDBStore({
	uri: DATABASE_URI,
	collection: 'sessions',
	expires: 1000 * 60 * 60 * 2,
})
const csrfProtection = csrf()

const multerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images')
	},
	filename: (req, file, cb) => {
		cb(null, `${uuidv4()} - ${file.originalname}`)
	},
})

const multerFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/avif' ||
		file.mimetype === 'image/jpeg'
	)
		return cb(null, true)
	req.fileProvided = true
	cb(null, false)
}

const getMessage = (req, type) => {
	const message = req.flash(type)
	if (message.length > 0) return message[0]
	return null
}

app.set('views', './views')
app.set('view engine', 'ejs')

app.use(helmet())
app.use(compression())

app.use((req, res, next) => {
	// res.setHeader('Access-Control-Allow-Origin', '*')
	// res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
	// res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	// res.setHeader('Cross-Origin-Opener-Policy', 'Same-Origin')
	// res.setHeader('Cross-Origin-Embedder-Policy', 'Require-Corp')
	// res.setHeader('Origin-Agent-Cluster', 'False')
	// res.setHeader(
	// 	'Content-Security-Policy',
	// 	"default-src data: gap: https://*.googleapis.com/ https://unpkg.com/ 'self' style-src 'self' 'unsafe-inline';"
	// )
	next()
})

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer({ storage: multerStorage, fileFilter: multerFilter }).single('image'))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/auth', express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

//  Initialize session for users authentication
app.use(
	session({
		secret: MONGO_CONNECT_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
		store: store,
	})
)
// CSRF protection for routes
app.use(csrfProtection)

app.use(flash())
// Default parameters for render templates
app.use((req, res, next) => {
	res.locals.errorMessage = getMessage(req, 'error')
	res.locals.successMessage = getMessage(req, 'success')
	res.locals.csrfToken = req.csrfToken()
	res.locals.prevAddress = req.headers.referer
	res.locals.isLoggedIn = req.session.isLoggedIn
	res.locals.userName = ''
	res.locals.notifCount = ''
	next()
})
// Chain user from previous request to current request with session
app.use(async (req, res, next) => {
	if (!req.session.user) return next()
	try {
		const user = await User.findById(req.session.user._id)
		res.locals.userName = user.name
		let notifCount = 0
		user.chatFriends.forEach((friend) => (notifCount = friend.seen ? notifCount : notifCount + 1))
		user.requests.forEach((request) => (notifCount = request.seen ? notifCount : notifCount + 1))
		res.locals.notifCount = notifCount > 9 ? '+9' : notifCount
		req.user = user
		next()
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
})

app.use(router)

// Setup detabase and start app
mongoose
	.connect(DATABASE_URI, {
		authSource: 'admin',
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then((result) => {
		const server = app.listen(PORT || 3000)
		Socket.deleteMany().then((data) => {})
		const io = require('./socket').init(server)
		io.on('connection', (socket) => {
			// console.log('id:' + socket.id + ' connected')
			socket.on('pvConnect', (userId, friendId) => {
				const newSocket = new Socket({
					userId: userId,
					socketId: socket.id,
					type: 'pvChat',
					friendId: friendId,
				})
				newSocket.save()
			})
			socket.on('pvDisconnect', (socketId) => {
				// console.log(socketId + ' disconnected')
				Socket.deleteOne({ socketId: socketId }).then((data) => {})
			})
			socket.on('join-team-chat', async (teamId, userId) => {
				const team = await Team.findById(teamId)
				const isMember =
					userId &&
					team.members.filter((member) => member.userId._id.toString() === userId.toString())
						.length > 0
				if (isMember) socket.join('team-' + teamId)
			})
			socket.on('test', (test) => {
				console.log(test)
			})
		})
	})
	.catch((err) => console.log(err))
