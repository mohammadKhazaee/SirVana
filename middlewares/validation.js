const { body, query, param } = require('express-validator')
const bcrypt = require('bcryptjs')

const User = require('../models/user')
const throwError = require('../middlewares/throwError')
const rank = require('../utils/rank')

const nameRegex = /[a-zA-Z0-9'\s]+/
const descRegex = /[^<>]+/

exports.postLogin = [
	body('email', 'Please enter email in right format!')
		.trim()
		.escape()
		.normalizeEmail({ gmail_remove_dots: false })
		.notEmpty()
		.isEmail()
		.custom(async (email, { req }) => {
			const user = await User.findOne({ email: email })
			if (!user) throwError(`Couldn't find email!`, 404)
			req.user = user
			return true
		}),
	body('password')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Please enter a password!')
		.isLength({ min: 8, max: 32 })
		.withMessage('Password should be 8 to 32 characters!')
		.custom(async (password, { req }) => {
			const isMatch = await bcrypt.compareSync(password, req.user.password)
			if (!isMatch) throwError(`Wrong password!`, 422)
			return true
		}),
]

exports.postSignup = [
	body('name')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('please enter your name!')
		.isLength({ min: 3 })
		.withMessage('name should be atleast 3 characters!'),
	body('email', 'Please enter email in right format!')
		.trim()
		.escape()
		.normalizeEmail({ gmail_remove_dots: false })
		.notEmpty()
		.isEmail()
		.custom(async (email, { req }) => {
			const user = await User.findOne({ email: email })
			if (user) throwError(`This email already exists!`, 422)
			return true
		}),
	body('password')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Please enter a password!')
		.isLength({ min: 8, max: 32 })
		.withMessage('Password should be 8 to 32 characters!'),
	body('confirmPass')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Please enter a password!')
		.isLength({ min: 8, max: 32 })
		.withMessage('Password should be 8 to 32 characters!')
		.custom((confirmPass, { req }) => {
			const password = req.body.password
			if (password !== confirmPass) throwError(`Passwords do not match!`, 422)
			return true
		}),
	body('dota2Id', 'Wrong dota2 id!')
		.trim()
		.escape()
		.escape()
		.notEmpty()
		.withMessage('Please enter your dota2 id!')
		.isNumeric()
		.isLength(9),
	body('discordId').trim().escape(),
	body('tos').trim().escape(),
]

exports.postResetPass = [
	body('email', 'Please enter email in right format!')
		.trim()
		.escape()
		.normalizeEmail({ gmail_remove_dots: false })
		.notEmpty()
		.isEmail()
		.custom(async (email, { req }) => {
			const user = await User.findOne({ email: email })
			req.resetPassUser = user
			if (!user) throwError(`Email doesnt exist!`, 404)
			return true
		}),
]

exports.getNewPass = [
	param('resetToken')
		.trim()
		.escape()
		.custom(async (resetToken, { req }) => {
			const user = await User.findOne({
				resetToken: resetToken,
				resetTokenExpiry: { $gt: Date.now() },
			})
			if (!user) throw 'Invalid token!'
			req.resetToken = resetToken
			req.newPassUser = user
			return true
		}),
]

exports.postNewPass = [
	body('password')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Please enter a password!')
		.isLength({ min: 8, max: 32 })
		.withMessage('Password should be 8 to 32 characters!'),
]

exports.getTeams = [
	query('sortType')
		.trim()
		.escape()
		.custom((sortType, { req }) => {
			if (sortType === 'اسم تیم' || sortType === '') {
				req.sortType = 'name'
				return true
			} else if (sortType === 'میانگین رنک' || sortType === 'تعداد اعضا') {
				req.sortType = sortType === 'میانگین رنک' ? '-avgMMR' : '-memberCount'
				return true
			}
			throw 'Wrong sort type!'
		}),
	query('lfp')
		.trim()
		.escape()
		.custom((lfp, { req }) => {
			if (lfp === 'on' || lfp === '') return true
			throw 'Wrong checkbox input!'
		}),
	query('search').trim().escape(),
	query('filter').trim().escape(),
]

exports.postTeam = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Enter name please!')
		.custom((name, { req }) => {
			if (name.match(nameRegex)[0] !== name)
				throw 'name should only contain english letters or numbers'
			return true
		}),
	body('nameTag')
		.trim()
		.notEmpty()
		.withMessage('Enter you team tag please!')
		.isLength({ min: 2, max: 3 })
		.withMessage('name tag should be 2 or 3 characters')
		.isAlpha('en-US')
		.withMessage('name tag should only contain english letters'),
	body('description')
		.trim()
		.custom((description, { req }) => {
			if (description.match(descRegex)[0] !== description)
				throw "description can't contain < or > character"
			return true
		}),
]

exports.getTournaments = [
	query('rankFilter')
		.trim()
		.escape()
		.custom((rankFilter, { req }) => {
			req.rankFilter = rank.giveNumberedMedal(rankFilter)
			req.marginLeft = rank.givePercent(rankFilter)
			if (rankFilter === '' || !rank.isRank(rankFilter)) req.marginLeft = undefined
			return true
		}),
	query('search').trim().escape(),
	query('filter').trim().escape(),
]

exports.postTournament = [
	body('name')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Enter name please!')
		.custom((name, { req }) => {
			if (name.match(nameRegex)[0] !== name)
				throw 'name should only contain english letters or numbers'
			return true
		}),
	body('minMMR')
		.trim()
		.escape()
		.custom((minMMR, { req }) => {
			if (req.body.freeMMRBox === 'on') return true
			if (minMMR === '') throw 'please choose a min mmr!'
			req.minMMR = rank.giveNumberedMedal(minMMR)
			if (req.minMMR) return true
			throw 'Wrong min mmr!'
		}),
	body('maxMMR')
		.trim()
		.escape()
		.custom((maxMMR, { req }) => {
			if (req.body.freeMMRBox === 'on') return true
			if (maxMMR === '') throw 'please choose a max mmr!'
			req.maxMMR = rank.giveNumberedMedal(maxMMR)
			if (!req.maxMMR) throw 'Wrong max mmr!'
			if (req.maxMMR.split('.')[0] < req.minMMR.split('.')[0]) {
				throw 'max mmr should be greater than min mmr!'
			} else return true
		}),
	body('boRadio').custom((boRadio, { req }) => {
		if (boRadio === 'true' || boRadio === 'false') return true
		throw 'unexpected value!'
	}),
	body('startDate')
		.notEmpty()
		.withMessage('Choose a date please!')
		.isISO8601()
		.withMessage('date is in wrong format'),
	body('prize')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Enter prize please!')
		.isNumeric()
		.withMessage('prize should only contain number'),
	body('description').trim().escape(),
]

exports.getPlayers = [
	query('minMMR')
		.trim()
		.escape()
		.custom((minMMR, { req }) => {
			req.minMMR = rank.giveNumberedMedal(minMMR)
		}),
	query('maxMMR')
		.trim()
		.escape()
		.custom((maxMMR, { req }) => {
			req.maxMMR = rank.giveNumberedMedal(maxMMR)
		}),
	query('lft')
		.trim()
		.escape()
		.custom((lft, { req }) => {
			if (lft === 'on' || lft === '') return true
			throw 'Wrong checkbox input!'
		}),
	query('search').trim().escape(),
	query('pos').trim().escape(),
	query('filter').trim().escape(),
]
