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

const app = express()
// The store that sessions will be store there
const store = new MongoDBStore({
	uri: process.env.DATABASE_URL,
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
	res.setHeader('Cross-Origin-Opener-Policy', 'Same-Origin')
	res.setHeader('Cross-Origin-Embedder-Policy', 'Require-Corp')
	res.setHeader('Origin-Agent-Cluster', 'False')
	// res.setHeader(
	// 	'Content-Security-Policy',
	// 	"default-src data: gap: https://*.googleapis.com/ https://unpkg.com/ 'self' style-src 'self' 'unsafe-inline';"
	// )
	next()
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer({ storage: multerStorage, fileFilter: multerFilter }).single('image'))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/auth', express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

//  Initialize session for users authentication
app.use(
	session({
		secret: process.env.MONGO_CONNECT_SECRET,
		resave: false,
		saveUninitialized: false,
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
	next()
})
// Chain user from previous request to current request with session
app.use(async (req, res, next) => {
	if (!req.session.user) return next()
	try {
		const user = await User.findById(req.session.user._id)
		res.locals.userName = user.name
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
	.connect(process.env.DATABASE_URL, {
		authSource: 'admin',
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then((result) => {
		app.listen(process.env.PORT || 3000)
	})
	.catch((err) => console.log(err))

mongoose.connection.on('open', () => {
	console.log('kiiiiiiiiiiiiiiif tu Rahimi')
})
