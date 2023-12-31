const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const User = require('../models/user')
const Team = require('../models/team')
const Tournament = require('../models/tournament')
const Socket = require('../models/socket')
const rank = require('../utils/rank')
const posUtil = require('../utils/pos')
const fileHelper = require('../utils/file')
const io = require('../socket')
const { format } = require('date-fns-tz')
const { compareAsc, add } = require('date-fns')

exports.getDashboard = async (req, res, next) => {
	try {
		const isOwner =
			req.originalUrl === '/dashboard' ||
			(req.user && req.user._id.toString() === req.params.userId)
		let user = req.user
		if (req.originalUrl !== '/dashboard') user = await User.findById(req.params.userId)
		const renderUser = { ...user._doc, imageUrl: user.imageUrl || 'img/default-player-dash.jpg' }
		renderUser.roles = renderUser.roles.map((role) => {
			switch (role) {
				case 'Player':
					return { name: 'بازیکن', color: 'coach' }
				case 'Team Leader':
					return { name: 'تیم لیدر', color: 'team' }
				case 'Organizer':
					return { name: 'تورنومت لیدر', color: 'tournament' }
			}
		})
		renderUser.pos = posUtil.toString(renderUser.pos)
		renderUser.mmr = { number: renderUser.mmr, medal: rank.numberToMedal(renderUser.mmr) }
		renderUser.createdAt = renderUser.createdAt.toISOString().split('T')[0].replaceAll('-', '/')
		let isMember = false
		if (!isOwner) {
			renderUser.feeds = renderUser.feeds.map((feed) => ({
				...feed._doc,
				comments: feed.comments.map((cm) => ({
					...cm._doc,
					yours: req.user && cm.sender.userId.toString() === req.user._id.toString(),
				})),
			}))
			isMember =
				req.user &&
				req.user.ownedTeam.teamId &&
				user.teams.findIndex(
					(team) => team.teamId.toString() === req.user.ownedTeam.teamId.toString()
				) !== -1
		}
		if (req.originalUrl !== '/dashboard' && isOwner) return res.redirect('/dashboard')
		res.status(200).render('dashboard', {
			pageTitle: `SirVana · ${req.originalUrl === '/dashboard' ? 'داشبورد' : renderUser.name}`,
			user: renderUser,
			isOwner: isOwner,
			isLeader: req.user && req.user.ownedTeam.teamId,
			isMember: isMember,
			isUser: req.user,
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
		renderUser.tournaments = [...renderUser.tournaments.filter((tour) => !tour.owned)]
		// console.log(renderUser.tournaments)
		res.status(200).render('dashboard-team', {
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
			request.seen = true
			if (request.type == 'join' || request.type == 'recruit' || request.type == 'joinTour')
				outReqs = [...outReqs, request]
			else inReqs = [...inReqs, request]
		})
		req.user.save()
		res.status(200).render('dashboard-notif', {
			pageTitle: 'SirVana · داشبورد',
			userId: req.user._id,
			chatFriends: req.user.chatFriends.reverse(),
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
		res.status(200).render('dashboard-settings', {
			pageTitle: 'SirVana · تنظیمات اکانت',
			user: req.user,
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postEditEmail = async (req, res, next) => {
	try {
		const errors = validationResult(req).array()
		if (errors.length > 0) {
			return res.status(422).send({ status: '422', errors: errors })
		}
		const email = req.body.email
		req.user.email = email
		await req.user.save()
		res.status(200).send({ status: '200', email: email })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postEditProfile = async (req, res, next) => {
	try {
		const errors = validationResult(req).array()
		if (errors.length > 0) {
			return res.status(422).send({ status: '422', errors: errors })
		}
		const name = req.body.name
		const pos = posUtil.toArray(req.body.pos)
		const inputRank = Number(req.body.rank)
		const discordId = req.body.discordId !== 'ثبت نشده' ? req.body.discordId : ''
		const dota2Id = req.body.dota2Id !== 'ثبت نشده' ? req.body.dota2Id : ''
		const bio = req.body.bio !== 'یه چیزی بنویس حالا. . .' ? req.body.bio : ''
		const lft = req.body.lft
		const imageUrl = req.file ? req.file.path.replace('\\', '/') : null

		if (req.user.mmr !== inputRank) {
			await Team.updateMany({ 'members.userId': req.user._id }, [
				{
					$set: {
						avgMMR: {
							$subtract: ['$avgMMR', { $divide: [req.user.mmr - inputRank, '$memberCount'] }],
						},
					},
				},
			])
		}

		req.user.name = name
		req.user.pos = pos
		req.user.mmr = inputRank
		req.user.discordId = discordId
		req.user.dota2Id = dota2Id
		req.user.lft = lft
		req.user.bio = bio

		let updateMembers = { 'members.$[docX].name': name },
			updatedChatFriends = { 'chatFriends.$[docX].name': name },
			updateOrg = { 'organizer.name': name }
		if (imageUrl) {
			const fileError = fileHelper.deleteFile(req.user.imageUrl)
			if (fileError) throw fileError
			req.user.imageUrl = imageUrl
			updateOrg = { ...updateOrg, 'organizer.imageUrl': imageUrl }
			updateMembers = {
				...updateMembers,
				'members.$[docX].imageUrl': imageUrl,
			}
			updatedChatFriends = {
				...updatedChatFriends,
				'chatFriends.$[docX].imageUrl': imageUrl,
			}
		}
		await req.user.save()
		await Tournament.updateMany({ 'organizer.userId': req.user._id }, { $set: updateOrg })
		await User.updateMany(
			{ 'chatFriends.userId': req.user._id },
			{ $set: { ...updatedChatFriends } },
			{ arrayFilters: [{ 'docX.userId': req.user._id }] }
		)
		await Team.updateMany(
			{ 'members.userId': req.user._id },
			{ $set: { ...updateMembers } },
			{ arrayFilters: [{ 'docX.userId': req.user._id }] }
		)
		await Team.updateMany({ 'leader.userId': req.user._id }, { $set: { 'leader.name': name } })
		res
			.status(200)
			.send({ status: '200', medal: rank.numberToMedal(inputRank), imageUrl: req.user.imageUrl })
	} catch (error) {
		console.log(error)
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postSendFeed = async (req, res, next) => {
	try {
		const feedId = await req.user.sendFeed(req.body.feedContent)
		res.status(200).send({ feeds: req.user.feeds, name: req.user.name, feedId: feedId })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postSendFeedComment = async (req, res, next) => {
	try {
		const commentContent = req.body.commentContent
		const receiver = await User.findById(req.body.userId)
		const commentId = await req.user.sendFeedComment(commentContent, receiver, req.body.feedId)
		res.status(200).send({
			sender: { name: req.user.name, userId: req.user._id },
			content: commentContent,
			commentId: commentId,
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postDeleteFeed = async (req, res, next) => {
	try {
		const { feedId, userId, url, isComment } = req.body
		let ownerId
		if (url.split('/')[3] === 'dashboard') ownerId = req.user._id.toString()
		if (url.split('/')[3] === 'player') ownerId = url.split('/')[4]
		if (
			!ownerId ||
			(ownerId && !mongoose.isValidObjectId(ownerId)) ||
			!mongoose.isValidObjectId(userId) ||
			!mongoose.isValidObjectId(feedId)
		) {
			const error = new Error('متن مورد نظر پیدا نشد')
			error.statusCode = 404
			throw error
		}
		let owner
		if (url.split('/')[3] === 'dashboard') owner = req.user
		else if (url.split('/')[3] === 'player') owner = await User.findById(ownerId)

		if (!isComment && url.split('/')[3] === 'dashboard') {
			owner.feeds = owner.feeds.filter((feed) => feed._id.toString() !== feedId)
			await owner.save()
		} else {
			owner.feeds = owner.feeds.map((feed) => ({
				...feed._doc,
				comments: feed.comments.filter(
					(cm) =>
						!(
							cm.sender.userId.toString() === req.user._id.toString() &&
							cm._id.toString() === feedId
						)
				),
			}))
			await owner.save()
		}
		res.status(200).send({ status: '200', isComment: isComment })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postJoinReq = async (req, res, next) => {
	try {
		const team = await Team.findById(req.body.teamId).populate('leader.userId')
		if (!team) {
			const error = new Error('تیم مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
		if (team.members.find((member) => member.userId.toString() === req.user._id.toString())) {
			const error = new Error('شما از قبل عضو این تیم هستید')
			error.statusCode = 403
			throw error
		}
		const teamLeader = team.leader.userId
		const reqId = await req.user.exchangeReq('join', team, undefined, {
			userId: team.leader.userId._id.toString(),
		})
		await teamLeader.exchangeReq('accPlayer', undefined, req.user, {
			reqId: reqId,
			userId: req.user._id,
		})
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postAccPlayer = async (req, res, next) => {
	try {
		const { reqId, reqInfo } = req.body
		const team = await Team.findById(req.user.ownedTeam.teamId)
		if (!team || (team && req.user._id.toString() !== team.leader.userId.toString())) {
			const error = new Error('شما صاحب این تیم نیستید')
			error.statusCode = 403
			throw error
		}
		const player = await User.findById(reqInfo.userId)
		if (!player) {
			const error = new Error('بازیکن مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
		if (team.members.find((member) => member.userId.toString() === reqInfo.userId)) {
			const error = new Error('این بازیکن از قبل عضو تیم شما هست')
			error.statusCode = 403
			throw error
		}
		const wrong = await req.user.handleReq(reqId, player, reqInfo.reqId, 'Accepted')
		if (wrong === 'wrong') return res.sendStatus(404)
		await player.joinToTeam(team)
		await team.recruitMember(player)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postRejPlayer = async (req, res, next) => {
	try {
		const { reqId, reqInfo } = req.body
		const player = await User.findById(reqInfo.userId)
		if (!player) {
			const error = new Error('بازیکن مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
		if (!req.user.ownedTeam.teamId) {
			const error = new Error('شما هنوز تیمی ندارید')
			error.statusCode = 404
			throw error
		}
		const wrong = req.user.handleReq(reqId, player, reqInfo.reqId, 'Rejected')
		if (wrong === 'wrong') return res.sendStatus(404)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postRecruitReq = async (req, res, next) => {
	try {
		const team = await Team.findById(req.user.ownedTeam.teamId)
		if (!team) {
			const error = new Error('شما هنوز تیمی ندارید')
			error.statusCode = 403
			throw error
		}
		const player = await User.findById(req.body.playerId)
		if (!player) {
			const error = new Error('بازیکن مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
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
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postAccRecruit = async (req, res, next) => {
	try {
		const { reqId, reqInfo, senderId } = req.body
		const team = await Team.findById(senderId)
		if (!team) {
			const error = new Error('تیم مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
		const teamLeader = await User.findById(team.leader.userId.toString())
		if (team.members.find((member) => member.userId.toString() === req.user._id.toString())) {
			const error = new Error('شما از قبل عضو این تیم هستید')
			error.statusCode = 403
			throw error
		}
		const wrong = await req.user.handleReq(reqId, teamLeader, reqInfo.reqId, 'Accepted')
		if (wrong === 'wrong') return res.sendStatus(404)
		await req.user.joinToTeam(team)
		await team.recruitMember(req.user)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postRejRecruit = async (req, res, next) => {
	try {
		const { reqId, reqInfo } = req.body
		const teamLeader = await User.findById(reqInfo.userId)
		if (!teamLeader) {
			const error = new Error('بازیکن مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
		const wrong = req.user.handleReq(reqId, teamLeader, reqInfo.reqId, 'Rejected')
		if (wrong === 'wrong') return res.sendStatus(404)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postJoinTourReq = async (req, res, next) => {
	try {
		const tournament = await Tournament.findById(req.body.tournamentId).populate('organizer.userId')
		if (!tournament) {
			const error = new Error('مسابقه مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
		if (!req.user.ownedTeam.teamId) {
			const error = new Error('شما صاحب هیچ تیمی نیستید')
			error.statusCode = 404
			throw error
		}
		if (
			tournament.teams.find(
				(team) => team.teamId.toString() === req.user.ownedTeam.teamId.toString()
			)
		) {
			const error = new Error('تیم شما از قبل عضو این مسابقه است')
			error.statusCode = 403
			throw error
		}
		if (req.user._id.toString() === tournament.organizer.userId._id.toString()) {
			const team = await Team.findById(req.user.ownedTeam.teamId)
			await tournament.addNewTeam(team)
			await team.joinToTournament(tournament, req.user._id.toString())
			return res.sendStatus(200)
		}
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
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postAccTeam = async (req, res, next) => {
	try {
		const { reqId, reqInfo, senderId } = req.body
		const team = await Team.findById(senderId)
		if (!team) {
			const error = new Error('تیم مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
		const teamLeader = await User.findById(team.leader.userId)
		const tournaments = req.user.tournaments.filter((tour) => tour.owned)
		if (tournaments.length === 0) {
			const error = new Error('شما صاحب مسابقه ای نیستید')
			error.statusCode = 404
			throw error
		}
		const tournament = await Tournament.findOne(tournaments[tournaments.length - 1].tournamentId)
		if (tournament.teams.find((tourTeam) => tourTeam.teamId.toString() === team._id.toString())) {
			const error = new Error('این تیم از قبل عضو مسابقه شما هست')
			error.statusCode = 403
			throw error
		}
		const wrong = await req.user.handleReq(reqId, teamLeader, reqInfo.reqId, 'Accepted')
		if (wrong === 'wrong') return res.sendStatus(404)
		await tournament.addNewTeam(team)
		await team.joinToTournament(tournament)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postRejTeam = async (req, res, next) => {
	try {
		const { reqId, reqInfo } = req.body
		const teamLeader = await User.findById(reqInfo.userId)
		if (!teamLeader) {
			const error = new Error('بازیکن مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
		if (req.user.tournaments.filter((tour) => tour.owned).length === 0) {
			const error = new Error('شما صاحب مسابقه ای نیستید')
			error.statusCode = 404
			throw error
		}
		const wrong = req.user.handleReq(reqId, teamLeader, reqInfo.reqId, 'Rejected')
		if (wrong === 'wrong') return res.sendStatus(404)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postRemoveTeam = async (req, res, next) => {
	try {
		const { leaderId } = req.body
		const teamLeader = await User.findById(leaderId).populate('ownedTeam.teamId')
		if (!teamLeader) {
			const error = new Error('تیم مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
		const team = teamLeader.ownedTeam.teamId
		if (!team._id) {
			const error = new Error('تیم مورد نظر شما پیدا نشد')
			error.statusCode = 404
			throw error
		}
		const tournaments = req.user.tournaments.filter((tour) => tour.owned)
		if (tournaments.length === 0) {
			const error = new Error('شما صاحب مسابقه ای نیستید')
			error.statusCode = 403
			throw error
		}
		const tournament = await Tournament.findOne(tournaments[tournaments.length - 1].tournamentId)
		if (!tournament.teams.find((tourTeam) => tourTeam.teamId.toString() === team._id.toString())) {
			const error = new Error('این تیم عضو مسابقه شما نیست')
			error.statusCode = 404
			throw error
		}
		await teamLeader.exchangeReq('teamRemoved', teamLeader, tournament)
		await tournament.removeTeam(team._id)
		await team.leaveTournament(tournament._id, req.user._id)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postDeleteReq = async (req, res, next) => {
	try {
		const { reqId, reqInfo } = req.body
		const receiver = await User.findById(reqInfo.userId)
		if (!receiver) {
			const error = new Error('بازیکن مورد نظر پیدا نشد')
			error.statusCode = 403
			throw error
		}
		const wrong = req.user.handleReq(reqId, receiver)
		if (wrong === 'wrong') return res.sendStatus(404)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.getPvMail = async (req, res, next) => {
	try {
		const friendId = req.params.friendId
		const friendChats = req.user.mails
			.filter((mail) => mail.responsor.userId.toString() === friendId)
			.map((pm) => ({ ...pm._doc, sentAt: format(pm.sentAt, 'd.M.yyyy - HH:mm') }))
		const updatedChatFriends = req.user.chatFriends.map((friend) => {
			if (friend.userId.toString() === friendId) friend.seen = true
			return friend
		})
		req.user.chatFriends = updatedChatFriends
		req.user.save()
		res.status(200).send(friendChats)
	} catch (error) {
		console.log(error)
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postPvMail = async (req, res, next) => {
	try {
		const responsorId = req.body.responsorId
		const mailContent = req.body.content
		const responsor = await User.findById(responsorId)
		if (!responsor) {
			const error = new Error('بازیکن مورد نظر پیدا نشد')
			error.statusCode = 403
			throw error
		}
		const lastMail = req.user.mails
			.filter((mail) => mail.responsor.userId.toString() === responsorId)
			.pop()
		const isDupe =
			lastMail &&
			lastMail.content === mailContent &&
			compareAsc(
				add(lastMail.sentAt, { seconds: 1 }),
				add(new Date(), { hours: 3, minutes: 30 })
			) === 1
		const sockets = await Socket.find({ type: 'pvChat', userId: responsorId })
		const inChat =
			sockets.findIndex((socket) => socket.friendId.toString() === req.user._id.toString()) !== -1
		const message = isDupe ? {} : await req.user.sendMail(responsor, mailContent, inChat, isDupe)
		if (sockets.length > 0) {
			io.getIO()
				.to(sockets[0].socketId)
				.emit('sendPvMail', { ...message, inComming: true, senderId: req.user._id, isDupe: isDupe })
		}
		res.status(201).send({ ...message, isDupe: isDupe })
	} catch (error) {
		console.log(error)
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}
