const { validationResult } = require('express-validator')

const User = require('../models/user')
const Team = require('../models/team')
const Tournament = require('../models/tournament')
const Message = require('../models/message')
const rank = require('../utils/rank')
const io = require('../socket')

const TEAM_PER_PAGE = 15
const TOURNAMENT_PER_PAGE = 11
const PLAYER_PER_PAGE = 16

exports.getIndex = async (req, res, next) => {
	const tournaments = await Tournament.find()
		.sort('startDate')
		.collation({ locale: 'en' }) // searching case insensitive
		.limit(3)
	const modifiedTournaments = tournaments.map((tournament) => {
		const dateTime = tournament.startDate.toISOString().slice(0, 16).replaceAll('-', '/').split('T')
		const { name, minMMR, maxMMR, imageUrl } = tournament
		return {
			name,
			startDate: `${dateTime[1]} - ${dateTime[0]}`,
			minMMR: minMMR.split('.')[1],
			maxMMR: maxMMR.split('.')[1],
			imageUrl: imageUrl,
		}
	})
	const canSend = req.user ? (req.user.lfMsgCd ? req.user.lfMsgCd < Date.now() : true) : false
	res.render('index', {
		pageTitle: 'SirVana',
		user: req.user
			? { userName: req.user.name, teams: [req.user.ownedTeam, ...req.user.teams] }
			: { userName: '', teams: [] },
		tournaments: modifiedTournaments,
		canSend: true,
	})
}

exports.getTeams = async (req, res, next) => {
	const sortType = req.sortType
	const lfpCheck = req.query.lfp === 'on'
	const searchInput = req.query.search || ''
	let noFilter, dbQuery
	if (searchInput !== '')
		if (lfpCheck)
			dbQuery = {
				name: { $regex: new RegExp(`.*${searchInput}.*`, 'i') },
				lfp: true,
			}
		else dbQuery = { name: { $regex: new RegExp(`.*${searchInput}.*`, 'i') } }
	else if (lfpCheck) dbQuery = { lfp: true }
	else {
		noFilter = true
		dbQuery = {}
	}
	// const newTeams = req.user.teams.filter(
	// 	(team) =>
	// 		team.teamId.toString() === '651526cffafae73e1474d307' ||
	// 		team.teamId.toString() === '6515635e7c2f8f02600ed499'
	// )
	try {
		const teams = await Team.find(dbQuery)
			.collation({ locale: 'en' }) // searching case insensitive
			.sort(sortType)
			.limit(TEAM_PER_PAGE)
		const renderTeams = teams.map((team) => ({ ...team._doc, avgMMR: Math.floor(team.avgMMR) }))
		res.render('teams', {
			pageTitle: 'SirVana · تیم ها',
			teams: renderTeams,
			lfpCheck: lfpCheck,
			sortType: req.query.sortType,
			searchInput: searchInput,
			noFilter: noFilter,
			oldInput: [],
			openModal: false,
			isNameValid: true,
			isNameTagValid: true,
			isDescValid: true,
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postTeam = async (req, res, next) => {
	const name = req.body.name
	const nameTag = req.body.nameTag
	const description = req.body.description

	const errors = validationResult(req).array()
	if (errors.length > 0) {
		const oldInput = {
			name: name,
			nameTag: nameTag,
			description: description,
		}
		const nameError = errors.find((error) => error.param === 'name')
		const nameTagError = errors.find((error) => error.param === 'nameTag')
		const descError = errors.find((error) => error.param === 'description')
		let nameTagMessage, nameMessage, descMessage
		if (nameError) nameMessage = nameError.msg
		if (nameTagError) nameTagMessage = nameTagError.msg
		if (descError) descMessage = descError.msg

		const teams = await Team.find().collation({ locale: 'en' }).limit(TEAM_PER_PAGE)
		const renderTeams = teams.map((team) => ({ ...team._doc, avgMMR: Math.floor(team.avgMMR) }))
		return res.status(422).render('teams', {
			pageTitle: 'SirVana · تیم ها',
			teams: renderTeams,
			lfpCheck: false,
			sortType: '',
			searchInput: '',
			noFilter: true,
			oldInput: oldInput,
			openModal: true,
			isNameValid: !nameError,
			isNameTagValid: !nameTagError,
			isDescValid: !descError,
		})
	}
	try {
		const imageUrl = req.file ? '/' + req.file.path.replace('\\', '/') : null
		const team = new Team({
			name: name,
			nameTag: nameTag,
			description: description,
			imageUrl: imageUrl,
			leader: {
				userId: req.user._id,
				name: req.user.name,
			},
			members: [
				{
					userId: req.user._id,
					name: req.user.name,
				},
			],
			avgMMR: req.user.mmr,
			lfp: false,
		})
		await team.save()
		await req.user.joinToTeam(team, 'Team Leader')
		// have to change redirection to /team/:teamId probably
		res.redirect('/teams')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getTournaments = async (req, res, next) => {
	const marginLeft = req.marginLeft
	const rankFilter = req.rankFilter
	const slided = req.query.slided === 'true'
	const searchInput = req.query.search
	const isFiltered = req.query.filter

	let dbQuery = {}
	if (searchInput !== '') dbQuery.name = { $regex: new RegExp(`.*${searchInput}.*`, 'i') }
	if (rankFilter && slided) {
		dbQuery.minMMR = { $lte: rankFilter }
		dbQuery.maxMMR = { $gte: rankFilter }
	}
	try {
		const tournaments = await Tournament.find(dbQuery)
			.collation({ locale: 'en' }) // searching case insensitive
			.limit(TOURNAMENT_PER_PAGE)
		const modifiedTournaments = tournaments.map((tournament) => {
			const dateTime = tournament.startDate
				.toISOString()
				.slice(0, 16)
				.replaceAll('-', '/')
				.split('T')
			const { name, minMMR, maxMMR, imageUrl } = tournament
			return {
				name,
				startDate: `${dateTime[1]} - ${dateTime[0]}`,
				minMMR: minMMR.split('.')[1],
				maxMMR: maxMMR.split('.')[1],
				imageUrl: imageUrl,
			}
		})
		res.render('tournaments', {
			pageTitle: 'SirVana · مسابقات',
			tournaments: modifiedTournaments,
			marginLeft: marginLeft || '-4%',
			rankFilter: req.query.rankFilter || '0',
			rankIcon: rankFilter ? rankFilter.split('.')[1] : 'Herald',
			searchInput: searchInput,
			noFilter: !isFiltered,
			oldInput: [],
			openModal: false,
			isNameValid: true,
			isRankValid: true,
			isDateValid: true,
			isPrizeValid: true,
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postTournament = async (req, res, next) => {
	const name = req.body.name
	const freeMMRBox = req.body.freeMMRBox === 'on'
	const minMMR = freeMMRBox ? '1.Herald' : req.minMMR
	const maxMMR = freeMMRBox ? '8.Immortal' : req.maxMMR
	const boRadio = req.body.boRadio
	const startDate = req.body.startDate
	const prize = req.body.prize
	const description = req.body.description

	const errors = validationResult(req).array()
	if (errors.length > 0) {
		const oldInput = {
			name: name,
			freeMMRBox: freeMMRBox,
			minMMR: minMMR,
			maxMMR: maxMMR,
			boRadio: boRadio,
			startDate: startDate,
			prize: prize,
			description: description,
		}
		const nameError = errors.find((error) => error.param === 'name')
		const minMMRError = errors.find((error) => error.param === 'minMMR')
		const maxMMRError = errors.find((error) => error.param === 'maxMMR')
		const rankError = [minMMRError, maxMMRError][0]
		const dateError = errors.find((error) => error.param === 'startDate')
		const prizeError = errors.find((error) => error.param === 'prize')
		let rankMessage, nameMessage, dateMessage, prizeMessage
		if (nameError) nameMessage = nameError.msg
		if (!freeMMRBox && rankError) rankMessage = rankError.msg
		if (dateError) dateMessage = dateError.msg
		if (prizeError) prizeMessage = prizeError.msg

		const tournaments = await Tournament.find()
			.collation({ locale: 'en' })
			.limit(TOURNAMENT_PER_PAGE)
		return res.status(422).render('tournaments', {
			pageTitle: 'SirVana · مسابقات',
			path: '/tournaments',
			oldInput: oldInput,
			tournaments: tournaments,
			marginLeft: '-4%',
			rankFilter: '0',
			rankIcon: 'Herald',
			searchInput: '',
			noFilter: true,
			openModal: true,
			isNameValid: !nameError,
			isRankValid: !(!freeMMRBox && rankError),
			isDateValid: !dateError,
			isPrizeValid: !prizeError,
		})
	}
	try {
		const imageUrl = req.file ? '/' + req.file.path.replace('\\', '/') : null

		const tournament = new Tournament({
			name: name,
			prize: prize,
			description: description,
			imageUrl: imageUrl,
			startDate: startDate,
			bo3: boRadio === 'true',
			minMMR: minMMR,
			maxMMR: maxMMR,
			organizer: {
				userId: req.user._id,
				name: req.user.name,
			},
		})
		// have to change redirection to /tournament/:tournamentId probably
		const createdTournament = await tournament.save()
		await req.user.createTour(tournament, 'Organizer')
		res.redirect('/tournaments')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getPlayers = async (req, res, next) => {
	const lft = req.query.lft === 'on'
	const minMMR = req.minMMR
	const maxMMR = req.maxMMR
	const searchInput = req.query.search
	const pos = req.query.pos

	let dbQuery = {}
	if (searchInput !== '') dbQuery.name = { $regex: new RegExp(`.*${searchInput}.*`, 'i') }
	if (minMMR || maxMMR) dbQuery.mmr = {}
	if (minMMR) dbQuery.mmr.$gte = rank.giveNumber(minMMR)
	if (maxMMR) dbQuery.mmr.$lte = rank.giveNumber(maxMMR)
	if (pos) dbQuery.pos = { $regex: new RegExp(`${pos}`) }
	if (lft) dbQuery.lft = lft

	try {
		const users = await User.find(dbQuery)
			.collation({ locale: 'en' }) // searching case insensitive
			.select('_id name pos mmr imageUrl lft')
			.limit(PLAYER_PER_PAGE)
		const modifiedUsers = users.map((user) => {
			return {
				...user._doc,
				mmr: rank.numberToMedal(user.mmr),
				pos: user.pos.join(' - '),
			}
		})
		res.render('players', {
			pageTitle: 'SirVana · بازیکنان',
			users: modifiedUsers,
			searchInput: searchInput,
			minMMR: rank.giveMedal(minMMR),
			maxMMR: rank.giveMedal(maxMMR),
			pos: pos,
			lft: lft,
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postSearchResult = async (req, res, next) => {
	const searchInput = req.body.searchInput.trim()
	const dbQuery = { name: { $regex: new RegExp('.*' + searchInput + '.*', 'i') } }
	const searchType = req.body.searchType
	const searchLimit = req.body.searchLimit ? Number(req.body.searchLimit) : 5
	let searchResult

	if (searchType === 'tournament') {
		searchResult = await Tournament.find(dbQuery)
			.select('_id name minMMR maxMMR')
			.limit(searchLimit)
		searchResult = searchResult.map((tournament) => {
			return {
				...tournament._doc,
				maxMMR: rank.giveMedal(tournament.maxMMR),
				minMMR: rank.giveMedal(tournament.minMMR),
			}
		})
	} else if (searchType === 'team') {
		searchResult = await Team.find(dbQuery).select('_id name avgMMR').limit(searchLimit)
		searchResult = searchResult.map((team) => {
			return { ...team._doc, avgMMR: rank.numberToMedal(team.avgMMR) }
		})
	} else if (searchType === 'player') {
		searchResult = await User.find(dbQuery).select('_id name pos mmr').limit(searchLimit)
		searchResult = searchResult.map((player) => {
			return { ...player._doc, pos: player.pos.join('-'), mmr: rank.numberToMedal(player.mmr) }
		})
	}

	// console.log(searchInput, searchResult)
	res.send({ searchResult: searchResult, searchType: searchType })
}

exports.getLfMessages = async (req, res, next) => {
	try {
		const messages = await Message.find().sort('createdAt').limit(20)
		res.send({ messages: messages })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postLfMessages = async (req, res, next) => {
	try {
		const recievedMsg = req.body
		let message
		if (recievedMsg.type === 'lfp') {
			const sender = req.user.teams.find((team) => team.name === recievedMsg.content.name)
			message = new Message({
				sender: { userId: sender.teamId, name: recievedMsg.content.name },
				content: `${recievedMsg.content.pos} ${recievedMsg.content.rank}`,
				type: recievedMsg.type,
			})
		} else {
			message = new Message({
				sender: { userId: req.user._id, name: req.user.name },
				content: `${recievedMsg.content.pos} ${recievedMsg.content.rank}`,
				type: recievedMsg.type,
			})
		}
		await message.save()
		req.user.lfMsgCd = Date.now() + 1000 * 60 * 60 * 1
		await req.user.save()
		io.getIO().emit('lf-message', message)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getRahimi = (req, res, next) => {
	res.render('rahimi', {
		pageTitle: 'SirVana · هوش مصنوعی',
	})
}
