const { body, query, param } = require('express-validator')
const { add, compareAsc } = require('date-fns')
const bcrypt = require('bcryptjs')

const User = require('../models/user')
const throwError = require('../middlewares/throwError')
const rank = require('../utils/rank')

const nameRegex = /[a-zA-Z0-9'\s]+/
const descRegex = /[^<>]+/

exports.postLogin = [
	body('email', 'ایمیلت یه مشکلی داره !')
		.trim()
		.escape()
		.normalizeEmail({ gmail_remove_dots: false })
		.notEmpty()
		.withMessage('* ایمیل یادت رفت !')
		.isEmail()
		.custom(async (email, { req }) => {
			const user = await User.findOne({ email: email })
			if (!user) throwError(`ایمیلت اشتباهه !`, 404)
			req.user = user
			return true
		}),
	body('password')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('* رمزو نمیخوای بزنی ؟')
		.isLength({ min: 8, max: 32 })
		.withMessage('رمزت باید بین 8 تا 32 کاراکتر باشه!')
		.custom(async (password, { req }) => {
			const isMatch = await bcrypt.compareSync(password, req.user.password)
			if (!isMatch) throwError(`رمزت اشتباهه !`, 422)
			return true
		}),
]

exports.postSignup = [
	body('name')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('* اسمتو پیشی خورد ؟')
		.isLength({ min: 3 })
		.withMessage('* اسمت کمتر از 3 حرفه!'),
	body('email', 'ایمیلت یه مشکلی داره !')
		.trim()
		.escape()
		.normalizeEmail({ gmail_remove_dots: false })
		.notEmpty()
		.withMessage('* ایمیل یادت رفت !')
		.isEmail()
		.custom(async (email, { req }) => {
			const user = await User.findOne({ email: email })
			if (user) throwError(`* مطمئنی اینجا اکانت نداری؟`, 422)
			return true
		}),
	body('password')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('* الو ؟ رمزت کو ؟')
		.isLength({ min: 8, max: 32 })
		.withMessage('رمزت باید بین 8 تا 32 کاراکتر باشه!'),
	body('confirmPass')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('* رمزو زدی . تکرارشم بزن !')
		.custom((confirmPass, { req }) => {
			const password = req.body.password
			if (password !== confirmPass) throwError(`* رمزهات یکی نیستن !`, 422)
			return true
		}),
	body('dota2Id', 'آیدیت یه مشکلی داره !')
		.trim()
		.escape()
		.escape()
		.notEmpty()
		.withMessage(' * آیدی خیلی بدردت میخوره ها !')
		.isNumeric()
		.isLength(9),
	body('discordId').trim().escape(),
]

exports.postResetPass = [
	body('email', 'ایمیلت یه مشکلی داره !')
		.trim()
		.escape()
		.normalizeEmail({ gmail_remove_dots: false })
		.notEmpty()
		.withMessage('* ایمیل یادت رفت !')
		.isEmail()
		.custom(async (email, { req }) => {
			const user = await User.findOne({ email: email })
			req.resetPassUser = user
			if (!user) throwError(`اکانتی با این ایمیل نداریم !`, 404)
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
		.withMessage('* الو ؟ رمزت کو ؟')
		.isLength({ min: 8, max: 32 })
		.withMessage('رمزت باید بین 8 تا 32 کاراکتر باشه!'),
]

exports.postEditProfile = [
	body('name')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('* اسمتو پیشی خورد ؟')
		.isLength({ min: 3 })
		.withMessage('* اسمت کمتر از 3 حرفه!'),
	body('dota2Id', 'آیدیت یه مشکلی داره !')
		.trim()
		.escape()
		.escape()
		.notEmpty()
		.withMessage(' * آیدی خیلی بدردت میخوره ها !')
		.isNumeric()
		.isLength(9),
	body('rank')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('رنکت خالی باشه ؟')
		.isInt({ min: 0, max: 13000 })
		.withMessage('رنکت حداکثر 13000 عه !'),
	body('lft')
		.trim()
		.custom((lfp, { req }) => {
			if (lfp === 'true' || lfp === 'false') {
				req.lfp = lfp === 'true'
				return true
			}
			throw 'تیم میخوای یا نه ؟'
		}),
	body('discordId').trim().escape(),
	body('bio').trim(),
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
		.withMessage('اسم تیم یادت رفت !')
		.custom((name, { req }) => {
			if (name.match(nameRegex)[0] !== name) throw 'اسم تیم باید انگلیسی باشه !'
			return true
		}),
	body('nameTag')
		.trim()
		.notEmpty()
		.withMessage('شناسه تیم رو بنویس !')
		.isLength({ min: 2, max: 3 })
		.withMessage('شناسه تیمت 2 یا 3 تا کاراکتره ها !')
		.isAlpha('en-US')
		.withMessage('اسم تیم باید انگلیسی باشه !'),
	body('description').trim(),
]

exports.postEditTeam = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('اسم تیم یادت رفت !')
		.custom((name, { req }) => {
			if (name.match(nameRegex)[0] !== name) throw 'اسم تیم باید انگلیسی باشه !'
			return true
		}),
	body('nameTag')
		.trim()
		.notEmpty()
		.withMessage('شناسه تیم رو بنویس !')
		.isLength({ min: 2, max: 3 })
		.withMessage('شناسه تیمت 2 یا 3 تا کاراکتره ها !')
		.isAlpha('en-US')
		.withMessage('اسم تیم باید انگلیسی باشه !'),
	body('lfp')
		.trim()
		.custom((lfp, { req }) => {
			if (lfp === 'true' || lfp === 'false') {
				req.lfp = lfp === 'true'
				return true
			}
			throw 'Wrong lfp input!'
		}),
	body('description').trim(),
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
		.notEmpty()
		.withMessage('اسم مسابقه یادت رفت !')
		.custom((name, { req }) => {
			if (name.match(nameRegex)[0] !== name) throw 'اسم مسابقه باید انگلیسی باشه !'
			return true
		}),
	body('minMMR')
		.trim()
		.escape()
		.custom((minMMR, { req }) => {
			if (req.body.freeMMRBox === 'on') return true
			if (minMMR === '') throw 'حداقل رنکو انتخاب کن !'
			req.minMMR = rank.giveNumberedMedal(minMMR)
			if (req.minMMR) return true
			throw 'حداقل رنک مشکل داره !'
		}),
	body('maxMMR')
		.trim()
		.escape()
		.custom((maxMMR, { req }) => {
			if (req.body.freeMMRBox === 'on') return true
			if (maxMMR === '') throw 'حداکثر رنکو انتخاب کن !'
			req.maxMMR = rank.giveNumberedMedal(maxMMR)
			if (!req.maxMMR) throw 'حداکثر رنک مشکل داره !'
			if (req.maxMMR.split('.')[0] < req.minMMR.split('.')[0]) {
				throw 'حداقل رنکت از حداکثر رنکت بیشتره !'
			} else return true
		}),
	body('bo3').custom((bo3, { req }) => {
		if (bo3 === 'true' || bo3 === 'false') return true
		throw 'unexpected value!'
	}),
	body('startDate')
		.notEmpty()
		.withMessage('تاریخ شروع مسابقه رو ننوشتی !')
		.isISO8601()
		.withMessage('date is in wrong format')
		.custom((startDate, { req }) => {
			if (compareAsc(add(new Date(), { hours: 1 }), new Date(startDate)) === -1) return true
			throw 'مسابقه دیروز برگذار میشه ؟'
		}),
	body('prize')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('بدون جایزه که حال نمیده !')
		.isNumeric()
		.withMessage('جایزه ای که نوشتی یه مشکلی داره !'),
	body('description').trim(),
]

exports.postEditTournament = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('اسم مسابقه یادت رفت !')
		.custom((name, { req }) => {
			if (name.match(nameRegex)[0] !== name) throw 'اسم مسابقه باید انگلیسی باشه !'
			return true
		}),
	body('minMMR')
		.trim()
		.escape()
		.custom((minMMR, { req }) => {
			if (req.body.freeMMRBox === 'on') return true
			if (minMMR === '') throw 'حداقل رنکو انتخاب کن !'
			req.minMMR = rank.giveNumberedMedal(minMMR)
			if (req.minMMR) return true
			throw 'حداقل رنک مشکل داره !'
		}),
	body('maxMMR')
		.trim()
		.escape()
		.custom((maxMMR, { req }) => {
			if (req.body.freeMMRBox === 'on') return true
			if (maxMMR === '') throw 'حداکثر رنکو انتخاب کن !'
			req.maxMMR = rank.giveNumberedMedal(maxMMR)
			if (!req.maxMMR) throw 'حداکثر رنک مشکل داره !'
			if (req.maxMMR.split('.')[0] < req.minMMR.split('.')[0]) {
				throw 'حداقل رنکت از حداکثر رنکت بیشتره !'
			} else return true
		}),
	body('bo3').custom((bo3, { req }) => {
		if (bo3 === 'true' || bo3 === 'false') return true
		throw 'unexpected value!'
	}),
	body('startDate')
		.notEmpty()
		.withMessage('تاریخ شروع مسابقه رو ننوشتی !')
		.isISO8601()
		.withMessage('date is in wrong format')
		.custom((startDate, { req }) => {
			if (compareAsc(add(new Date(), { hours: 1 }), new Date(startDate)) === -1) return true
			throw 'مسابقه دیروز برگذار میشه ؟'
		}),
	body('prize')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('بدون جایزه که حال نمیده !')
		.isNumeric()
		.withMessage('جایزه ای که نوشتی یه مشکلی داره !'),
	body('description').trim(),
	body('teamCount')
		.trim()
		.escape()
		.notEmpty()
		.withMessage('تعداد تیما رو یادت رفت !')
		.isNumeric()
		.withMessage('تعداد تیم باید عدد باشه !')
		.isInt({ min: 4, max: 64 })
		.withMessage('تعداد تیما باید بین 4 تا 64 تیم باشه !'),
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
