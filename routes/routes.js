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
Router.use((req, res, next) => {
	if (req.url.split('/')[2]) return res.redirect('/sfsfsfseefsef')
	res.render('errors', {
		pageTitle: 'Not Found',
		status: '404',
	})
})

// Handles server-side errors
Router.use((err, req, res, next) => {
	console.log(err)
	res.render('errors', {
		pageTitle: 'Not Working',
		status: '500',
		error: err,
	})
})

module.exports = Router
