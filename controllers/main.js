const { validationResult } = require('express-validator')

const User = require('../models/user')
const Team = require('../models/team')
const Tournament = require('../models/tournament')
const Message = require('../models/message')
const rank = require('../utils/rank')
const io = require('../socket')

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
	res.render('index', {
		pageTitle: 'SirVana',
		tournaments: modifiedTournaments,
	})
}

exports.getTeams = async (req, res, next) => {
	const TEAM_PER_PAGE = 15
	const sortType = req.sortType
	const lfpCheck = req.query.lfp === 'on'
	// const checkOption = lfpCheck ? { lfp: true } : {}
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

	try {
		const teams = await Team.find(dbQuery)
			.collation({ locale: 'en' }) // searching case insensitive
			.sort(sortType)
			.limit(TEAM_PER_PAGE)
		res.render('teams', {
			pageTitle: 'SirVana · تیم ها',
			teams: teams,
			lfpCheck: lfpCheck,
			sortType: req.query.sortType,
			searchInput: searchInput,
			noFilter: noFilter,
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
		avgMMR: req.user.mmr || 0,
		lfp: false,
	})
	try {
		await team.save()
		// have to change redirection to /team/:teamId probably
		res.redirect('/teams')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getTournaments = async (req, res, next) => {
	const TOURNAMENT_PER_PAGE = 11
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
	try {
		const createdTournament = await tournament.save()
		// console.log(createdTournament)
		// have to change redirection to /tournament/:tournamentId probably
		res.redirect('/tournaments')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getPlayers = async (req, res, next) => {
	const TEAM_PER_PAGE = 16
	const lft = req.query.lft === 'on'
	const minMMR = req.minMMR
	const maxMMR = req.maxMMR
	const searchInput = req.query.search
	const pos = req.query.pos
	const isFiltered = req.query.filter

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
			.limit(TEAM_PER_PAGE)
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

	if (searchType === 'tournament')
		searchResult = await Tournament.find(dbQuery)
			.select('_id name minMMR maxMMR')
			.limit(searchLimit)
	else if (searchType === 'team')
		searchResult = await Team.find(dbQuery).select('_id name avgMMR').limit(searchLimit)
	else if (searchType === 'player')
		searchResult = await User.find(dbQuery).select('_id name pos mmr').limit(searchLimit)

	// console.log(searchInput, searchResult)
	res.send({ searchResult: searchResult })
}

exports.getMessages = async (req, res, next) => {
	try {
		const messages = await Message.find().limit(20)
		res.send({ messages: messages })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postMessage = async (req, res, next) => {
	try {
		const recievedMsg = req.body
		const message = new Message({
			sender: { userId: req.user._id, name: req.user.name },
			content: recievedMsg.content,
			type: recievedMsg.type,
		})
		await message.save()
		io.getIO().emit('message', message)
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
