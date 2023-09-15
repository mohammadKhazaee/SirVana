const { body, query } = require('express-validator')
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

module.exports.getTeams = [
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
]

module.exports.postTeam = [
	body('name')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Enter name please!')
		.isAlphanumeric()
		.withMessage('name should only contain english letters or numbers'),
	body('nameTag')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Enter you team tag please!')
		.isLength({ min: 2, max: 3 })
		.withMessage('name tag should be 2 or 3 characters')
		.isAlpha()
		.withMessage('name tag should only contain english letters'),
	body('description').trim().escape(),
]

module.exports.getTournaments = [
	query('rankFilter')
		.trim()
		.escape()
		.custom((rankFilter, { req }) => {
			switch (rankFilter) {
				case '':
					req.noFilter = true
				case '0':
					req.rankFilter = '1.Herald'
					req.marginLeft = '-4%'
					break
				case '14.28':
					req.rankFilter = '2.Guardian'
					req.marginLeft = '10.28%'
					break
				case '28.56':
					req.rankFilter = '3.Crusader'
					req.marginLeft = '23.56%'
					break
				case '42.84':
					req.rankFilter = '4.Archon'
					req.marginLeft = '36.84%'
					break
				case '57.12':
					req.rankFilter = '5.Legend'
					req.marginLeft = '51.12%'
					break
				case '71.4':
					req.rankFilter = '6.Ancient'
					req.marginLeft = '64.4%'
					break
				case '85.68':
					req.rankFilter = '7.Divine'
					req.marginLeft = '77.68%'
					break
				case '99.96':
					req.rankFilter = '8.Immortal'
					req.marginLeft = '91%'
					break
				default:
					throw 'Wrong rank filter!'
			}
			return true
		}),
	query('search').trim().escape(),
]

module.exports.postTournament = [
	body('name')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Enter name please!')
		.isAlphanumeric()
		.withMessage('name should only contain english letter and number'),
	body('minMMR')
		.trim()
		.escape()
		.custom((minMMR, { req }) => {
			switch (minMMR) {
				case 'Herald':
					req.minMMR = '1.Herald'
					break
				case 'Guardian':
					req.minMMR = '2.Guardian'
					break
				case 'Crusader':
					req.minMMR = '3.Crusader'
					break
				case 'Archon':
					req.minMMR = '4.Archon'
					break
				case 'Legend':
					req.minMMR = '5.Legend'
					break
				case 'Ancient':
					req.minMMR = '6.Ancient'
					break
				case 'Divine':
					req.minMMR = '7.Divine'
					break
				case 'Immortal':
					req.minMMR = '8.Immortal'
					break
				case '':
					throw 'please choose a min mmr!'
				default:
					throw 'Wrong min mmr!'
			}
			return true
		}),
	body('maxMMR')
		.trim()
		.escape()
		.custom((maxMMR, { req }) => {
			switch (maxMMR) {
				case 'Herald':
					req.maxMMR = '1.Herald'
					break
				case 'Guardian':
					req.maxMMR = '2.Guardian'
					break
				case 'Crusader':
					req.maxMMR = '3.Crusader'
					break
				case 'Archon':
					req.maxMMR = '4.Archon'
					break
				case 'Legend':
					req.maxMMR = '5.Legend'
					break
				case 'Ancient':
					req.maxMMR = '6.Ancient'
					break
				case 'Divine':
					req.maxMMR = '7.Divine'
					break
				case 'Immortal':
					req.maxMMR = '8.Immortal'
					break
				case '':
					throw 'please choose a max mmr!'
				default:
					throw 'Wrong max mmr!'
			}
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
