const { validationResult } = require('express-validator')

const User = require('../models/user')
const Team = require('../models/team')
const Tournament = require('../models/tournament')
const rank = require('../utils/rank')
const io = require('../socket')

exports.getDashboard = async (req, res, next) => {
	try {
		const isOwner =
			req.originalUrl === '/dashboard' ||
			(req.user && req.user._id.toString() === req.params.userId)
		let user = req.user
		if (req.originalUrl !== '/dashboard') user = await User.findById(req.params.userId)
		const renderUser = { ...user._doc }
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
		renderUser.pos = user.pos.join('-')
		if (renderUser.pos === '1-2-3-4-5') renderUser.pos = 'همه'
		if (renderUser.pos === '') renderUser.pos = 'ثبت نشده'
		renderUser.mmr = { number: renderUser.mmr, medal: rank.numberToMedal(renderUser.mmr) }
		renderUser.createdAt = renderUser.createdAt.toISOString().split('T')[0].replaceAll('-', '/')
		if (req.originalUrl !== '/dashboard' && isOwner) return res.redirect('/dashboard')
		res.render('dashboard', {
			pageTitle: 'SirVana · داشبورد',
			user: renderUser,
			isOwner: isOwner,
			isLeader: req.user && req.user.ownedTeam,
			path: isOwner ? '' : '../',
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
		let inReqs = [],
			outReqs = []
		req.user.requests.forEach((request) => {
			if (request.type == 'accPlayer' || request.type == 'accRecruit' || request.type == 'accTeam')
				inReqs = [...inReqs, request]
			else outReqs = [...outReqs, request]
		})
		// console.log(inReqs)
		res.render('dashboard-notif', {
			pageTitle: 'SirVana · داشبورد',
			inReqs: inReqs,
			outReqs: outReqs,
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.getDashboardSettings = async (req, res, next) => {
	try {
		res.render('dashboard-settings', {
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
		const imageUrl = req.file ? '/' + req.file.path.replace('\\', '/').slice(1) : req.user.imageUrl

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
		await req.user.sendFeed(req.body.feedContent)
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
		req.user.sendFeedComment(commentContent, receiver, req.body.feedId)
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
		// checks if you're one of team members already or not
		const newPlayer = !team.members.find(
			(member) => member.userId.toString() === req.user._id.toString()
		)
		if (newPlayer) {
			const teamLeader = team.leader.userId
			const reqId = await req.user.exchangeReq('join', team, undefined, {
				userId: team.leader.userId._id.toString(),
			})
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
	try {
		const { reqId, reqInfo } = req.body
		const team = await Team.findById(req.user.ownedTeam.teamId)
		const player = await User.findById(reqInfo.userId)
		const wrong = await req.user.handleReq(reqId, player, reqInfo.reqId, 'Accepted')
		if (wrong === 'wrong') return res.sendStatus(404)
		await player.joinToTeam(team)
		await team.recruitMember(player)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postRejPlayer = async (req, res, next) => {
	try {
		const { reqId, reqInfo } = req.body
		const player = await User.findById(reqInfo.userId)
		const wrong = req.user.handleReq(reqId, player, reqInfo.reqId, 'Rejected')
		if (wrong === 'wrong') return res.sendStatus(404)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postRecruitReq = async (req, res, next) => {
	try {
		const team = await Team.findById(req.user.ownedTeam.teamId)
		const player = await User.findById(req.body.playerId)
		const newPlayer = !team.members.find(
			(member) => member.userId.toString() === player._id.toString()
		)
		if (newPlayer) {
			const reqId = await req.user.exchangeReq('recruit', player, undefined, {
				userId: req.body.playerId,
			})
			await player.exchangeReq('accRecruit', undefined, team, {
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

exports.postAccRecruit = async (req, res, next) => {
	try {
		const { reqId, reqInfo, senderId } = req.body
		const team = await Team.findById(senderId)
		const teamLeader = await User.findById(reqInfo.userId)
		const wrong = await req.user.handleReq(reqId, teamLeader, reqInfo.reqId, 'Accepted')
		if (wrong === 'wrong') return res.sendStatus(404)
		await req.user.joinToTeam(team)
		await team.recruitMember(req.user)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postRejRecruit = async (req, res, next) => {
	try {
		const { reqId, reqInfo } = req.body
		const teamLeader = await User.findById(reqInfo.userId)
		const wrong = req.user.handleReq(reqId, teamLeader, reqInfo.reqId, 'Rejected')
		if (wrong === 'wrong') return res.sendStatus(404)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postJoinTourReq = async (req, res, next) => {
	try {
		const tournament = await Tournament.findById(req.body.tournamentId).populate('organizer.userId')
		const newTeam = !tournament.teams.find(
			(team) => team.teamId.toString() === req.user.ownedTeam.teamId.toString()
		)
		if (newTeam) {
			const organizer = tournament.organizer.userId
			const reqId = await req.user.exchangeReq('joinTour', tournament, undefined, {
				userId: tournament.organizer.userId._id.toString(),
			})
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
	try {
		const { reqId, reqInfo, senderId } = req.body
		const team = await Team.findById(senderId)
		const teamLeader = await User.findById(reqInfo.userId)
		const wrong = await req.user.handleReq(reqId, teamLeader, reqInfo.reqId, 'Accepted')
		if (wrong === 'wrong') return res.sendStatus(404)
		const tournaments = req.user.tournaments.filter((tour) => tour.owned)
		const tournament = await Tournament.findOne(tournaments[tournaments.length - 1].tournamentId)
		await tournament.addNewTeam(team)
		await team.joinToTournament(tournament)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postRejTeam = async (req, res, next) => {
	try {
		const { reqId, reqInfo } = req.body
		const teamLeader = await User.findById(reqInfo.userId)
		const wrong = req.user.handleReq(reqId, teamLeader, reqInfo.reqId, 'Rejected')
		if (wrong === 'wrong') return res.sendStatus(404)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postDeleteReq = async (req, res, next) => {
	try {
		const { reqId, reqInfo } = req.body
		const receiver = await User.findById(reqInfo.userId)
		const wrong = req.user.handleReq(reqId, receiver)
		if (wrong === 'wrong') return res.sendStatus(404)
		res.sendStatus(200)
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
