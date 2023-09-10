const express = require('express')

const mainRouter = require('./main')
const authRouter = require('./auth')

const Router = express.Router()

Router.use('/auth', authRouter)
Router.use(mainRouter)

// Handle not found routes
Router.use((req, res, next) => {
	res.render('404', {
		pageTitle: 'Not Found',
	})
})

module.exports = Router
