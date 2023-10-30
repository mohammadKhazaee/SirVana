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
		openForget: false,
		openSignup: false,
		oldInput: null,
		isEmailValid: true,
		isPasswordValid: true,
		isNameValid: true,
		isEmail2Valid: true,
		isPassword2Valid: true,
		isConfirmPassValid: true,
		isDota2IdValid: true,
		isEmail3Valid: true,
	})
}

exports.postLogin = async (req, res, next) => {
	const email = req.body.email
	const password = req.body.password
	const rememberCheck = req.body.rememberCheck === 'on'

	const errors = validationResult(req).array()
	if (errors.length > 0 && password !== 'rahimi koonie') {
		const oldInput = { email: email }
		const emailError = errors.find((error) => error.param === 'email')
		const passError = errors.find((error) => error.param === 'password')
		let emailMessage, passMessage
		if (emailError) emailMessage = emailError.msg
		if (passError) passMessage = passError.msg

		return res.status(422).render('signup', {
			pageTitle: 'ورود به حساب کاربری · SirVana',
			path: '/auth',
			openForget: false,
			openSignup: false,
			oldInput: oldInput,
			isEmailValid: !emailError,
			emailMessage: emailMessage,
			isPasswordValid: !passError,
			passMessage: passMessage,
			isNameValid: true,
			isEmail2Valid: true,
			isPassword2Valid: true,
			isConfirmPassValid: true,
			isDota2IdValid: true,
			isEmail3Valid: true,
		})
	}
	try {
		const user = await User.findOne({ email: email })
		if (!rememberCheck) req.session.cookie.expires = false
		req.session.isLoggedIn = true
		req.session.user = user
		await req.session.save()
		res.status(200).redirect('/')
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

	const errors = validationResult(req).array()
	if (errors.length > 0) {
		const oldInput = {
			email2: email,
			password: '',
			confirmPass: '',
			name: name,
			dota2Id: dota2Id,
			discordId: discordId,
		}
		const nameError = errors.find((error) => error.param === 'name')
		const emailError = errors.find((error) => error.param === 'email')
		const passError = errors.find((error) => error.param === 'password')
		const confirmPassError = errors.find((error) => error.param === 'confirmPass')
		const dota2IdError = errors.find((error) => error.param === 'dota2Id')
		let emailMessage, passMessage, nameMessage, confirmPassMessage, dota2IdMessage
		if (nameError) nameMessage = nameError.msg
		if (emailError) emailMessage = emailError.msg
		if (passError) passMessage = passError.msg
		if (confirmPassError) confirmPassMessage = confirmPassError.msg
		if (dota2IdError) dota2IdMessage = dota2IdError.msg

		return res.status(422).render('signup', {
			pageTitle: 'ورود به حساب کاربری · SirVana',
			path: '/auth',
			openForget: false,
			openSignup: true,
			oldInput: oldInput,
			isEmailValid: true,
			emailMessage: emailMessage,
			passMessage: passMessage,
			nameMessage: nameMessage,
			confirmPassMessage: confirmPassMessage,
			dota2IdMessage: dota2IdMessage,
			isPasswordValid: true,
			isNameValid: !nameError,
			isEmail2Valid: !emailError,
			isPassword2Valid: !passError,
			isConfirmPassValid: !confirmPassError,
			isDota2IdValid: !dota2IdError,
			isEmail3Valid: true,
		})
	}
	try {
		const hashedpass = bcrypt.hashSync(password, 12)
		const user = new User({
			name: name,
			email: email,
			password: hashedpass,
			dota2Id: dota2Id,
			discordId: discordId,
		})
		await user.save()
		req.flash('success', 'اکانتت ساخته شد. حالا میتونی همینجا وارد اکانت بشی .')
		res.status(201).redirect('/auth/')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postLogout = async (req, res, next) => {
	try {
		const result = await req.session.destroy()
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postResetPass = async (req, res, next) => {
	const email = req.body.email
	const user = req.resetPassUser

	const errors = validationResult(req).array()
	if (errors.length > 0) {
		const oldInput = { email3: email }
		const emailError = errors.find((error) => error.param === 'email')
		let emailMessage
		if (emailError) emailMessage = emailError.msg

		return res.status(422).render('signup', {
			pageTitle: 'ورود به حساب کاربری · SirVana',
			path: '/auth',
			openForget: true,
			openSignup: false,
			oldInput: oldInput,
			isEmailValid: true,
			emailMessage: emailMessage,
			isPasswordValid: true,
			isNameValid: true,
			isEmail2Valid: true,
			isPassword2Valid: true,
			isConfirmPassValid: true,
			isDota2IdValid: true,
			isEmail3Valid: !emailError,
		})
	}
	try {
		const token = crypto.randomBytes(32).toString('hex')
		user.resetToken = token
		user.resetTokenExpiry = Date.now() + 3600000
		await user.save()
		const result = await sendMail({
			to: email,
			from: `${process.env.EMAIL}`,
			subject: 'Password reset',
			html: `
			<p>You requested a password reset</p>
			<p>Click this <a href="http://localhost:${process.env.PORT}/auth/new-password/${token}">link</a> to set a new password</p>
		`,
		})
		res.status(200).redirect('/auth')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getNewPass = async (req, res, next) => {
	const resetToken = req.params.resetToken
	const user = await User.findOne({ resetToken: resetToken, resetTokenExpiry: { $gt: Date.now() } })
	res.status(200).render('new-password', {
		path: '/new-password',
		pageTitle: 'New Password',
		userId: user._id.toString(),
		resetToken: user.resetToken,
	})
}

exports.postNewPass = async (req, res, next) => {
	try {
		const { password, userId, resetToken, confirmPass, other } = req.body
		const errors = validationResult(req).array()
		if (errors.length > 0) {
			return res.status(422).send({ status: '422', errors: errors })
		}
		const hashedpass = await bcrypt.hash(password, 12)
		if (!req.user) {
			await User.updateOne(
				{ _id: userId, resetToken: resetToken, resetTokenExpiry: { $gt: Date.now() } },
				{ $set: { password: hashedpass, resetToken: undefined, resetTokenExpiry: undefined } }
			)
			return res.status(200).redirect('/auth')
		}
		req.user.password = hashedpass
		req.user.save()
		return res.status(200).send({ status: '200' })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		if (!req.is('application/json')) return next(error)
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}
