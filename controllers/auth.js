const crypto = require('crypto')

const bcrypt = require('bcryptjs')
require('dotenv').config()
const { validationResult } = require('express-validator')

const User = require('../models/user')
const throwError = require('../middlewares/throwError')
const sendMail = require('../utils/sendMail')

exports.getLogin = (req, res, next) => {
	res.render('signup', {
		pageTitle: 'ورود به حساب کاربری · SirVana',
	})
}
exports.postLogin = async (req, res, next) => {
	const email = req.body.email
	const rememberCheck = req.body.rememberCheck === 'on'
	// console.log('login shodi hooraaaaaa')
	try {
		const user = await User.findOne({ email: email })
		if (!rememberCheck) req.session.cookie.expires = false
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
	const dota2Id = req.body.dota2Id
	const discordId = req.body.discordId

	// console.log('sign up shodi')
	try {
		const hashedpass = bcrypt.hashSync(password, 12)
		const user = new User({
			name: name,
			email: email,
			password: hashedpass,
			dota2Id: dota2Id,
			discordId: discordId,
			// roles: ['Player'],
		})
		await user.save()
		res.redirect('/auth/')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postLogout = async (req, res, next) => {
	// console.log('logout shodi')
	try {
		const result = await req.session.destroy()
		// console.log(result)
		res.redirect('/')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postResetPass = async (req, res, next) => {
	const email = req.body.email
	const user = req.resetPassUser
	try {
		const token = crypto.randomBytes(32).toString('hex')
		user.resetToken = token
		user.resetTokenExpiry = Date.now() + 3600000
		user.save()
		const result = await sendMail({
			to: email,
			from: `${process.env.EMAIL}`,
			subject: 'Password reset',
			html: `
			<p>You requested a password reset</p>
			<p>Click this <a href="http://localhost:${process.env.PORT}/auth/new-password/${token}">link</a> to set a new password</p>
		`,
		})
		console.log(result)
		res.redirect('/auth')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getNewPass = async (req, res, next) => {
	const user = req.newPassUser
	res.render('new-password', {
		path: '/new-password',
		pageTitle: 'New Password',
		userId: user._id.toString(),
		resetToken: user.resetToken,
	})
}

exports.postNewPass = async (req, res, next) => {
	const password = req.body.password
	const token = req.body.resetToken
	const userId = req.body.userId
	try {
		const hashedpass = await bcrypt.hash(password, 12)
		const user = await User.updateOne(
			{ _id: userId, resetToken: token, resetTokenExpiry: { $gt: new Date().now() } },
			{ $set: { password: hashedpass, resetToken: undefined, resetTokenExpiry: undefined } }
		)
		res.redirect('/auth')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}
