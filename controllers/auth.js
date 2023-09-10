const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
require('dotenv').config()
const { validationResult } = require('express-validator')

const User = require('../models/user')
const throwError = require('../middlewares/throwError')

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	service: 'gmail',
	auth: {
		type: 'OAUTH2',
		user: process.env.EMAIL, //set these in your .env file
		clientId: process.env.OAUTH_CLIENT_ID,
		clientSecret: process.env.OAUTH_CLIENT_SECRET,
		refreshToken: process.env.OAUTH_REFRESH_TOKEN,
		accessToken: process.env.OAUTH_ACCESS_TOKEN,
		expires: 3599,
	},
})

exports.getLogin = (req, res, next) => {
	res.render('signup', {
		pageTitle: 'ورود به حساب کاربری · SirVana',
	})
}
exports.postLogin = async (req, res, next) => {
	const email = req.body.email
	// console.log('login shodi hooraaaaaa')
	try {
		const user = await User.findOne({ email: email })
		req.session.isLoggedIn = true
		req.session.user = user
		await req.session.save()
		res.redirect('/')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postSignup = async (req, res, next) => {
	const name = req.body.name
	const email = req.body.email
	const password = req.body.password

	console.log('sign up shodi')
	try {
		const hashedpass = bcrypt.hashSync(password, 12)
		const user = new User({
			name: name,
			email: email,
			password: hashedpass,
			roles: ['Player'],
		})
		await user.save()
		res.redirect('/auth/')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postResetPass = (req, res, next) => {
	console.log('email send kardim')
	res.redirect('/auth/login')
}
