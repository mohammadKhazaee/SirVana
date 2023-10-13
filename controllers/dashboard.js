const { validationResult } = require('express-validator')

const User = require('../models/user')
const Team = require('../models/team')
const Tournament = require('../models/tournament')
const rank = require('../utils/rank')
const io = require('../socket')

exports.getDashboard = async (req, res, next) => {
	try {
		const renderUser = { ...req.user._doc }
		let isLeader = false
		renderUser.roles = renderUser.roles.map((role) => {
			switch (role) {
				case 'Player':
					return { name: 'بازیکن', color: 'coach' }
				case 'Team Leader':
					isLeader = true
					return { name: 'تیم لیدر', color: 'team' }
				case 'Organizer':
					return { name: 'تورنومت لیدر', color: 'tournament' }
			}
		})
		renderUser.pos = renderUser.pos.length !== 5 ? renderUser.pos.join('-') : 'همه'
		renderUser.mmr = { number: renderUser.mmr, medal: rank.numberToMedal(renderUser.mmr) }
		renderUser.createdAt = renderUser.createdAt.toISOString().split('T')[0].replaceAll('-', '/')
		// console.log(renderUser.pos)
		res.render('dashboard', {
			pageTitle: 'SirVana · داشبورد',
			user: renderUser,
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getDashboardTeam = async (req, res, next) => {
	try {
		const populatedUser = await User.findById(req.user._id).populate(
			'ownedTeam.teamId teams.teamId tournaments.tournamentId'
		)
		const renderUser = { ...populatedUser._doc }
		if (renderUser.ownedTeam.teamId)
			renderUser.ownedTeam.teamId._doc.avgMMR = rank.numberToMedal(
				renderUser.ownedTeam.teamId.avgMMR
			)
		renderUser.teams = renderUser.teams.map((team) => {
			team.teamId._doc.avgMMR = rank.numberToMedal(team.teamId.avgMMR)
			return team
		})
		renderUser.ownedTournaments = [...renderUser.tournaments.filter((tour) => tour.owned)]
		res.render('dashboard-team', {
			pageTitle: 'SirVana · داشبورد',
			user: renderUser,
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getDashboardNotif = async (req, res, next) => {
	try {
		res.render('dashboard-notif', {
			pageTitle: 'SirVana · داشبورد',
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postEditProfile = async (req, res, next) => {
	try {
		const name = req.body.name
		const pos =
			req.body.pos !== 'ثبت نشده' && req.body.pos !== 'مثال: 4-5' ? req.body.pos.split('-') : []
		const inputRank = Number(req.body.rank)
		const discordId = req.body.discordId !== 'ثبت نشده' ? req.body.discordId : ''
		const dota2Id = req.body.dota2Id !== 'ثبت نشده' ? req.body.dota2Id : ''
		const bio = req.body.bio !== 'یه چیزی بنویس حالا. . .' ? req.body.bio : ''
		const lft = req.body.lft
		const imageUrl = req.file ? '/' + req.file.path.replace('\\', '/') : req.user.imageUrl

		req.user.imageUrl = imageUrl
		req.user.name = name
		req.user.pos = pos
		req.user.mmr = inputRank
		req.user.discordId = discordId
		req.user.dota2Id = dota2Id
		req.user.lft = lft
		req.user.bio = bio
		await req.user.save()
		res.status(200).send({ medal: rank.numberToMedal(inputRank) })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postSendFeed = async (req, res, next) => {
	try {
		const feedContent = req.body.feedContent
		await req.user.sendFeed(feedContent)
		res.status(200).send({ feeds: req.user.feeds, name: req.user.name })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postSendFeedComment = async (req, res, next) => {
	try {
		const commentContent = req.body.commentContent
		const receiver = await User.findById(req.body.userId)
		const feedId = req.body.feedId
		req.user.sendFeedComment(commentContent, receiver, feedId)
		res
			.status(200)
			.send({ sender: { name: req.user.name, userId: req.user._id }, content: commentContent })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postJoinReq = async (req, res, next) => {
	try {
		const team = await Team.findById(req.body.teamId).populate('leader.userId')
		// check if you're one of team members already or not
		const newPlayer = team.members.find(
			(member) => member.userId.toString() === req.user._id.toString()
		)
		if (!newPlayer) {
			const teamLeader = team.leader.userId
			const reqId = await req.user.exchangeReq('join', team, undefined)
			await teamLeader.exchangeReq('accPlayer', undefined, req.user, {
				reqId: reqId,
				userId: req.user._id,
			})
		}
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postAccPlayer = async (req, res, next) => {
	const teamId = req.body.teamId
	const playerId = req.body.playerId

	try {
		const team = req.user.teams.find((team) => team.teamId === teamId)
		const player = await User.findById(playerId)

		await player.joinToTeam(team)
		await team.recruitMember(player)
		res.redirect('/dashboard')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postReqruitReq = async (req, res, next) => {
	const teamId = req.body.teamId
	const playerId = req.body.playerId
	try {
		const team = await Team.findById(teamId)
		const player = await User.findById(playerId)

		await req.user.exchangeReq('reqruit', player, team)
		await player.exchangeReq('accRecruit', undefined, team)
		// have to change redirect path
		res.redirect('/')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postAccRecruit = async (req, res, next) => {
	const teamId = req.body.teamId
	try {
		const team = await Team.findById(teamId)
		await req.user.joinToTeam(team)
		await team.recruitMember(req.user)
		res.redirect('/dashboard')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postJoinTourReq = async (req, res, next) => {
	try {
		const tournament = await Tournament.findById(req.body.tournamentId).populate('organizer.userId')
		const newTeam = tournament.teams.find(
			(team) => team.teamId.toString() === req.user.ownedTeam.teamId.toString()
		)
		if (!newTeam) {
			const organizer = tournament.organizer.userId
			const reqId = await req.user.exchangeReq('joinTour', tournament)
			await organizer.exchangeReq(
				'accTeam',
				tournament,
				{ _id: req.user.ownedTeam.teamId, name: req.user.ownedTeam.name },
				{ reqId: reqId, userId: req.user._id }
			)
		}
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postAccTeam = async (req, res, next) => {
	const tournamentId = req.body.tournamentId
	const teamId = req.body.teamId
	try {
		// change state of requests
		const tournament = await Tournament.findById(tournamentId)
		const team = await Team.findById(teamId)
		await tournament.addNewTeam(team)
		await team.joinToTournament(tournament)
		// should be redirect to tournament/:tournamentId
		res.redirect('/dashboard')
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getPvMail = async (req, res, next) => {
	// fetch all mail with the user
}

exports.postPvMail = async (req, res, next) => {
	try {
		const responsorId = req.body.responsorId
		const mailContent = req.body.mailContent
		const responsor = await User.findById(responsorId)
		await req.user.sendMail(responsor, mailContent)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}
