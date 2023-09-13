const { validationResult } = require('express-validator')

const Team = require('../models/team')

exports.getIndex = (req, res, next) => {
	res.render('index', {
		pageTitle: 'SirVana',
	})
}

exports.getTeams = async (req, res, next) => {
	const TEAM_PER_PAGE = 15
	const sortType = req.sortType
	const lfpCheck = req.query.lfp === 'true'
	const checkOption = lfpCheck ? { lfp: true } : {}

	try {
		const teams = await Team.find(checkOption)
			.collation({ locale: 'en' }) // searching case insensitive
			.sort(sortType)
			.limit(TEAM_PER_PAGE)
		res.render('teams', {
			pageTitle: 'SirVana · تیم ها',
			teams: teams,
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
		const createdTeam = await team.save()
		console.log(createdTeam)
		// have to change redirection to /team/:teamId probably
		res.redirect('/teams')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getTournaments = (req, res, next) => {
	res.render('tournaments', {
		pageTitle: 'SirVana · مسابقات',
	})
}

exports.getRahimi = (req, res, next) => {
	res.render('rahimi', {
		pageTitle: 'SirVana · هوش مصنوعی',
	})
}
