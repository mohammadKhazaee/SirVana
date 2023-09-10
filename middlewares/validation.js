const { body } = require('express-validator')
const bcrypt = require('bcryptjs')

const User = require('../models/user')
const throwError = require('../middlewares/throwError')

module.exports.postLogin = [
	body('email', 'Please enter email in right format!')
		.trim()
		.normalizeEmail({ gmail_remove_dots: false })
		.notEmpty()
		.isEmail()
		.custom(async (email, { req }) => {
			const user = User.findOne({ email: email })
			if (!user) throwError(`Couldn't find email!`, 404)
			req.user = user
			return true
		}),
	body('password')
		.trim()
		.notEmpty()
		.withMessage('Please enter a password!')
		.isLength({ min: 8, max: 32 })
		.withMessage('Password should be 8 to 32 characters!')
		.custom((password, { req }) => {
			const isMatch = bcrypt.compareSync(password, req.user.password)
			if (!isMatch) throwError(`Wrong password!`, 422)
			return true
		}),
]

module.exports.postSignup = [
	// checkTOS ro doros kon
	body('email', 'Please enter email in right format!')
		.trim()
		.normalizeEmail({ gmail_remove_dots: false })
		.notEmpty()
		.isEmail()
		.custom(async (email, { req }) => {
			console.log('email')
			const user = await User.findOne({ email: email })
			if (user) throwError(`This email already exists!`, 422)
			return true
		}),
	body('password')
		.trim()
		.notEmpty()
		.withMessage('Please enter a password!')
		.isLength({ min: 8, max: 32 })
		.withMessage('Password should be 8 to 32 characters!'),
	body('confirmPass')
		.trim()
		.notEmpty()
		.withMessage('Please enter a password!')
		.isLength({ min: 8, max: 32 })
		.withMessage('Password should be 8 to 32 characters!')
		.custom(async (confirmPass, { req }) => {
			const password = req.body.password
			if (password !== confirmPass) throwError(`Passwords do not match!`, 422)
			return true
		}),
]

module.exports.postResetPass = [
	body('email', 'Please enter email in right format!')
		.trim()
		.normalizeEmail({ gmail_remove_dots: false })
		.notEmpty()
		.isEmail()
		.custom(async (email, { req }) => {
			const user = User.findOne({ email: email })
			if (!user) throwError(`Email doesnt exist!`, 404)
			return true
		}),
]
