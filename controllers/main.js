const { validationResult } = require('express-validator')

const User = require('../models/user')
const Team = require('../models/team')
const Tournament = require('../models/tournament')

exports.getIndex = (req, res, next) => {
	res.render('index', {
		pageTitle: 'SirVana',
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
	const searchInput = req.query.search
	let dbQuery
	if (!req.noFilter) {
		if (searchInput !== '')
			dbQuery = dbQuery = {
				name: { $regex: new RegExp(`.*${searchInput}.*`, 'i') },
				minMMR: { $lte: rankFilter },
				maxMMR: { $gte: rankFilter },
			}
		else
			dbQuery = {
				minMMR: { $lte: rankFilter },
				maxMMR: { $gte: rankFilter },
			}
	} else {
		dbQuery = {}
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
			const { name, minMMR, maxMMR } = tournament
			return {
				name,
				startDate: `${dateTime[1]} - ${dateTime[0]}`,
				minMMR: minMMR.split('.')[1],
				maxMMR: maxMMR.split('.')[1],
			}
		})

		res.render('tournaments', {
			pageTitle: 'SirVana · مسابقات',
			tournaments: modifiedTournaments,
			marginLeft: marginLeft,
			rankFilter: req.query.rankFilter || '0',
			rankIcon: rankFilter.split('.')[1],
			searchInput: searchInput,
			noFilter: req.noFilter,
		})
	} catch (error) {
		console.log(error)
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
		searchResult = await Team.find(dbQuery)
			.select('_id name avgMMR lfp memberCount')
			.limit(searchLimit)
	else if (searchType === 'player')
		searchResult = await User.find(dbQuery).select('_id name pos mmr lft').limit(searchLimit)

	// console.log(searchInput, searchResult)
	res.send({ searchResult: searchResult })
}

exports.getRahimi = (req, res, next) => {
	res.render('rahimi', {
		pageTitle: 'SirVana · هوش مصنوعی',
	})
}
