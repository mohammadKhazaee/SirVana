const express = require('express')

const mainRouter = require('./main')
const authRouter = require('./auth')
const dashboardRouter = require('./dashboard')
const isAuth = require('../middlewares/isAuth')

const Router = express.Router()

Router.use('/auth', authRouter)
Router.use('/dashboard', isAuth, dashboardRouter)
Router.use(mainRouter)

// Handle not found routes
Router.use((req, ress, next) => {
	ress.render('404', {
		pageTitle: 'Not Found',
	})
})

// Handles server-side errors
Router.use((err, req, res, next) => {
	console.log(err)
	res.render('500', {
		pageTitle: 'Not Working',
		error: err,
	})
})

module.exports = Router
