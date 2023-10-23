const { validationResult } = require('express-validator')
const { format } = require('date-fns-tz')
const { add, sub } = require('date-fns')

const User = require('../models/user')
const Team = require('../models/team')
const Tournament = require('../models/tournament')
const Message = require('../models/message')
const Socket = require('../models/socket')
const rank = require('../utils/rank')
const posUtil = require('../utils/pos')
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
		canSend: canSend,
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

exports.getTeam = async (req, res, next) => {
	try {
		const team = await Team.findById(req.params.teamId).populate({
			path: 'members.userId',
			select: 'mmr _id pos',
		})
		const renderTeam = {
			...team._doc,
			createdAt: team.createdAt.toISOString().split('T')[0].replaceAll('-', '/'),
			avgMMR: rank.numberToMedal(team.avgMMR),
			members: team.members.map((member) => {
				let renderPos
				if (member.pos) renderPos = member.pos
				else renderPos = posUtil.toString(member.userId.pos)
				return {
					...member._doc,
					pos: renderPos,
					userId: { mmr: rank.numberToMedal(member.userId.mmr), _id: member.userId._id },
				}
			}),
		}
		if (req.user) {
			renderTeam.chats = team.chats.map((chat) => ({
				...chat._doc,
				incomming: chat.sender.userId.toString() !== req.user._id.toString(),
				sentAt: format(chat.sentAt, 'd.M.yyyy - HH:mm'),
			}))
		}
		// console.log(renderTeam)
		const isMember =
			req.user &&
			renderTeam.members.filter(
				(member) => member.userId._id.toString() === req.user._id.toString()
			).length > 0
		const isLead = req.user && renderTeam.leader.userId.toString() === req.user._id.toString()
		res.render('team-info', {
			pageTitle: 'SirVana · مسابقات',
			team: renderTeam,
			userId: req.user ? req.user._id : undefined,
			isMember: isMember,
			isLead: isLead,
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postTeam = async (req, res, next) => {
	try {
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
		const imageUrl = req.file ? req.file.path.replace('\\', '/') : 'img/default-team-picture.jpg'
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
					isLead: true,
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

exports.postEditTeam = async (req, res, next) => {
	try {
		const name = req.body.name
		const nameTag = req.body.nameTag
		const description = req.body.description
		const membersPos = req.body.membersPos
		const imageUrl = req.file ? req.file.path.replace('\\', '/') : null
		const teamId = req.body.teamId
		const team = await Team.findById(teamId)
		team.name = name
		team.nameTag = nameTag
		team.description = description
		team.members = team.members.map((member, i) => ({ ...member._doc, pos: membersPos[2 * i] }))
		let updateOwnedTeam = { 'teams.$.name': name, 'ownedTeam.name': name },
			updateObj = { 'teams.$[docX].name': name }
		if (imageUrl) {
			updatedTeam.imageUrl = imageUrl
			updateObj = { ...updateObj, 'teams.$[docX].imageUrl': imageUrl }
			updateOwnedTeam = {
				...updateOwnedTeam,
				'ownedTeam.imageUrl': imageUrl,
				'teams.$.imageUrl': imageUrl,
			}
		}
		// change all refrences when user update
		await team.save()
		await User.updateMany({ 'teams.teamId': req.body.teamId }, { $set: updateOwnedTeam })
		await Tournament.updateMany(
			{ 'teams.teamId': req.body.teamId },
			{
				$set: {
					...updateObj,
					'games.$[docY].team1.name': name,
					'games.$[docZ].team2.name': name,
				},
			},
			{
				arrayFilters: [
					{ 'docX.teamId': req.body.teamId },
					{ 'docY.team1.teamId': req.body.teamId },
					{ 'docZ.team2.teamId': req.body.teamId },
				],
			}
		)
		res.sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postTeamChat = async (req, res, next) => {
	try {
		const chatContent = req.body.chatContent
		const team = await Team.findById(req.body.teamId)
		const message = {
			content: chatContent.trim(),
			sentAt: add(new Date(), { hours: 3, minutes: 30 }),
			sender: { userId: req.user._id, name: req.user.name },
		}
		team.chats = [...team._doc.chats, message]
		team.save()
		io.getIO()
			.to('team-' + req.body.teamId)
			.emit('team-chat', {
				...message,
				sentAt: format(new Date(), 'd.M.yyyy - HH:mm'),
				// incomming: message.sender.userId.toString() !== req.user._id.toString(),
			})
		res.sendStatus(200)
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
			const { _id, name, minMMR, maxMMR, imageUrl } = tournament
			return {
				_id: _id,
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

exports.getTournament = async (req, res, next) => {
	try {
		const tournament = await Tournament.findById(req.params.tournamentId).populate(
			'teams.teamId organizer.userId'
		)
		const renderTournament = {
			...tournament._doc,
			startDate: {
				span: format(sub(tournament.startDate, { hours: 3, minutes: 30 }), 'd.MMM.yyyy - HH:mm'),
				input: tournament.startDate.toISOString().slice(0, 16),
			},
			teams: tournament.teams.map((team) => ({
				...team._doc,
				teamId: {
					...team.teamId._doc,
					avgMMR: rank.numberToMedal(team.teamId.avgMMR),
				},
			})),
			organizer: {
				...tournament.organizer._doc,
				userId: {
					...tournament.organizer.userId._doc,
					mmr: rank.numberToMedal(tournament.organizer.userId.mmr),
				},
			},
			games: tournament.games.map((game) => ({
				...game._doc,
				dateTime: game.dateTime.toISOString().slice(0, 16),
			})),
		}
		// console.log(renderTournament.games)
		const isOrganizer =
			req.user && renderTournament.organizer.userId._id.toString() === req.user._id.toString()
		const isLeader = !(!req.user || !req.user.ownedTeam.teamId)
		res.render('tournament-info', {
			pageTitle: 'SirVana · مسابقات',
			tournament: renderTournament,
			isOrganizer: isOrganizer,
			isLeader: isLeader,
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
		const imageUrl = req.file
			? '/' + req.file.path.replace('\\', '/').slice(1)
			: 'img/tourcards.png'

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

exports.postEditTournament = async (req, res, next) => {
	try {
		const name = req.body.name
		const bo3 = req.body.bo3 === 'true'
		const startDate = req.body.startDate
		const prize = Number(req.body.prize)
		const teamCount = Number(req.body.teamCount)
		const minMMR = rank.giveNumberedMedal(req.body.minMMR)
		const maxMMR = rank.giveNumberedMedal(req.body.maxMMR)
		const description = req.body.description
		const imageUrl = req.file ? req.file.path.replace('\\', '/') : null
		const games = JSON.parse(req.body.games).map((game) => ({
			...game,
			dateTime: add(new Date(game.dateTime), { hours: 3, minutes: 30 }),
		}))
		const updatedTournament = {
			name: name,
			prize: prize,
			teamCount: teamCount,
			description: description,
			bo3: bo3,
			minMMR: minMMR,
			maxMMR: maxMMR,
			games: games,
		}
		let updateObj = { 'tournaments.$.name': name }
		if (imageUrl) {
			updatedTournament.imageUrl = imageUrl.slice(1)
			updateObj = { ...updateObj, 'tournaments.$.imageUrl': imageUrl }
		}
		if (startDate) updatedTournament.startDate = add(new Date(startDate), { hours: 3, minutes: 30 })
		// console.log(updatedTournament)
		await Tournament.updateOne({ _id: req.body.tournamentId }, { $set: updatedTournament })
		res.sendStatus(200)
		await User.updateMany(
			{ 'tournaments.tournamentId': req.body.tournamentId },
			{ $set: updateObj }
		)
		await Team.updateMany(
			{ 'tournaments.tournamentId': req.body.tournamentId },
			{ $set: updateObj }
		)
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
			let renderPos = user.pos.join(' - ')
			if (renderPos === '1 - 2 - 3 - 4 - 5') renderPos = 'همه'
			if (renderPos === '') renderPos = 'ثبت نشده'
			return {
				...user._doc,
				mmr: rank.numberToMedal(user.mmr),
				pos: renderPos,
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
		searchResult = await User.find(dbQuery).select('_id imageUrl name pos mmr').limit(searchLimit)
		searchResult = searchResult.map((player) => {
			return {
				...player._doc,
				pos: player.pos.length !== 5 ? player.pos.join('-') : 'همه',
				mmr: rank.numberToMedal(player.mmr),
			}
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
