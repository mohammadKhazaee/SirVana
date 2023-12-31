const { validationResult } = require('express-validator')
const { format } = require('date-fns-tz')
const { add, sub, compareAsc } = require('date-fns')

const User = require('../models/user')
const Team = require('../models/team')
const Tournament = require('../models/tournament')
const Message = require('../models/message')
const Socket = require('../models/socket')
const rank = require('../utils/rank')
const fileHelper = require('../utils/file')
const posUtil = require('../utils/pos')
const io = require('../socket')

const TEAM_PER_PAGE = 15
const TOURNAMENT_PER_PAGE = 11
const PLAYER_PER_PAGE = 16

const prevQuery = (query) => {
	if (!query) return ''
	if (query.indexOf('&p=') === -1) return query
	return query.slice(0, query.indexOf('&p='))
}

exports.getIndex = async (req, res, next) => {
	const tournaments = await Tournament.find()
		.sort('startDate')
		.collation({ locale: 'en' }) // searching case insensitive
		.limit(3)
	const modifiedTournaments = tournaments.map((tournament) => {
		const dateTime = tournament.startDate.toISOString().slice(0, 16).replaceAll('-', '/').split('T')
		const { _id, name, minMMR, maxMMR, imageUrl } = tournament
		return {
			_id: _id,
			name: name,
			startDate: `${dateTime[1]} - ${dateTime[0]}`,
			minMMR: minMMR.split('.')[1],
			maxMMR: maxMMR.split('.')[1],
			imageUrl: imageUrl,
		}
	})
	const canSend = req.user ? (req.user.lfMsgCd ? req.user.lfMsgCd < Date.now() : true) : false
	res.status(200).render('index', {
		pageTitle: 'SirVana',
		user: req.user
			? { userName: req.user.name, ownedTeam: req.user.ownedTeam.name }
			: { userName: '', ownedTeam: '' },
		tournaments: modifiedTournaments,
		canSend: canSend,
	})
}

exports.getTeams = async (req, res, next) => {
	try {
		const sortType = req.sortType
		const lfpCheck = req.query.lfp === 'on'
		const searchInput = req.query.search || ''
		const page = Number(req.query.p || 1)
		const query = prevQuery(req.originalUrl.split('?')[1])

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
		const teamsCount = await Team.countDocuments(dbQuery)
		const teams = await Team.find(dbQuery)
			.skip((page - 1) * TEAM_PER_PAGE)
			.collation({ locale: 'en' }) // searching case insensitive
			.sort(sortType)
			.limit(TEAM_PER_PAGE)
		const renderTeams = teams.map((team) => ({ ...team._doc, avgMMR: Math.floor(team.avgMMR) }))
		res.status(200).render('teams', {
			pageTitle: 'SirVana · تیم ها',
			query: '?' + query + '&',
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
			page: {
				multiple: teamsCount > TEAM_PER_PAGE,
				current: page,
				last: Math.ceil(teamsCount / TEAM_PER_PAGE),
				hasPrev: page > 1,
				prev: page - 1,
				hasNext: page < Math.ceil(teamsCount / TEAM_PER_PAGE),
				next: page + 1,
			},
			cantCreate: !req.user || (req.user && req.user.ownedTeam.teamId),
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
		if (!team) return res.status(404).redirect('/404')
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
		res.status(200).render('team-info', {
			pageTitle: 'SirVana · ' + team.name,
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

		if (req.user.ownedTeam.teamId) {
			req.flash('error', 'You already have your own team!')
			return res.status(403).redirect('/teams')
		}
		const errors = validationResult(req).array()
		if (errors.length > 0) {
			const oldInput = {
				name: name,
				nameTag: nameTag,
				description: description,
			}
			const nameError = errors.find((error) => error.param === 'name')
			const nameTagError = errors.find((error) => error.param === 'nameTag')
			let nameTagMessage, nameMessage
			if (nameError) nameMessage = nameError.msg
			if (nameTagError) nameTagMessage = nameTagError.msg

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
				nameTagMessage: nameTagMessage,
				nameMessage: nameMessage,
				page: { multiple: false },
				hasTeam: false,
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
					imageUrl: req.user.imageUrl,
					pos: posUtil.toString(req.user.pos),
					isLead: true,
				},
			],
			avgMMR: req.user.mmr,
			lfp: false,
		})
		const teamDoc = await team.save()
		await req.user.joinToTeam(team, 'Team Leader')
		res.status(201).redirect('/team/' + teamDoc._id)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postEditTeam = async (req, res, next) => {
	try {
		if (
			!req.user.ownedTeam.teamId ||
			(req.user.ownedTeam.teamId && req.user.ownedTeam.teamId.toString() !== req.body.teamId)
		) {
			const error = new Error('شما سازنده این تیم نیستید')
			error.statusCode = 403
			throw error
		}
		const errors = validationResult(req).array()
		if (errors.length > 0) {
			return res.status(422).send({ status: '422', errors: errors })
		}
		const name = req.body.name
		const nameTag = req.body.nameTag
		const description = req.body.description
		const membersPos = req.body.membersPos
		const lfp = req.lfp
		const imageUrl = req.file ? req.file.path.replace('\\', '/') : null
		const teamId = req.body.teamId
		const team = await Team.findById(teamId)

		team.name = name
		team.lfp = lfp
		team.nameTag = nameTag
		team.description = description
		team.members = team.members.map((member, i) => ({ ...member._doc, pos: membersPos[2 * i] }))

		let updateOwnedTeam = { 'ownedTeam.name': name },
			updateTeam = { 'teams.$.name': name },
			updateObj = { 'teams.$[docX].name': name }
		if (imageUrl) {
			const fileError = fileHelper.deleteFile(team.imageUrl)
			if (fileError) throw fileError
			team.imageUrl = imageUrl
			updateObj = { ...updateObj, 'teams.$[docX].imageUrl': imageUrl }
			updateTeam = { ...updateTeam, 'teams.$.imageUrl': imageUrl }
			updateOwnedTeam = { ...updateOwnedTeam, 'ownedTeam.imageUrl': imageUrl }
		}
		await team.save()
		await User.updateMany({ 'ownedTeam.teamId': req.body.teamId }, { $set: updateOwnedTeam })
		await User.updateMany({ 'teams.teamId': req.body.teamId }, { $set: updateTeam })
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
		res.status(200).send({ status: '200', imageUrl: team.imageUrl })
	} catch (error) {
		console.log(error)
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postTeamChat = async (req, res, next) => {
	try {
		const chatContent = req.body.chatContent
		const team = await Team.findById(req.body.teamId)
		if (!team.members.find((member) => member.userId.toString() === req.user._id.toString()))
			return res.status(403).send({ status: '403', errors: 'Not authorized!' })
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
			})
		res.sendStatus(201)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.getTournaments = async (req, res, next) => {
	try {
		const marginLeft = req.marginLeft
		const rankFilter = req.rankFilter
		const slided = req.query.slided === 'true'
		const searchInput = req.query.search
		const isFiltered = req.query.filter
		const page = Number(req.query.p || 1)
		const query = prevQuery(req.originalUrl.split('?')[1])

		let dbQuery = {}
		if (searchInput !== '') dbQuery.name = { $regex: new RegExp(`.*${searchInput}.*`, 'i') }
		if (rankFilter && slided) {
			dbQuery.minMMR = { $lte: rankFilter }
			dbQuery.maxMMR = { $gte: rankFilter }
		}
		const tournamentsCount = await Tournament.countDocuments(dbQuery)
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
		res.status(200).render('tournaments', {
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
			query: '?' + query + '&',
			page: {
				multiple: tournamentsCount > TOURNAMENT_PER_PAGE,
				current: page,
				last: Math.ceil(tournamentsCount / TOURNAMENT_PER_PAGE),
				hasPrev: page > 1,
				prev: page - 1,
				hasNext: page < Math.ceil(tournamentsCount / TOURNAMENT_PER_PAGE),
				next: page + 1,
			},
			hasTour:
				!req.user ||
				(req.user &&
					req.user.tournaments.find(
						(tour) =>
							tour.owned &&
							compareAsc(add(new Date(), { hours: 3, minutes: 30 }), tour.startDate) === -1
					)),
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
		if (!tournament) return res.status(404).redirect('/404')
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
		const isParticipant =
			req.user &&
			req.user.ownedTeam.teamId &&
			renderTournament.teams.findIndex(
				(team) => team.teamId._id.toString() === req.user.ownedTeam.teamId.toString()
			) !== -1
		res.status(200).render('tournament-info', {
			pageTitle: 'SirVana · ' + tournament.name,
			tournament: renderTournament,
			isOrganizer: isOrganizer,
			isLeader: isLeader,
			isParticipant: isParticipant,
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postTournament = async (req, res, next) => {
	try {
		const name = req.body.name
		const freeMMRBox = req.body.freeMMRBox === 'on'
		const minMMR = freeMMRBox ? '1.Herald' : req.minMMR
		const maxMMR = freeMMRBox ? '8.Immortal' : req.maxMMR
		const boRadio = req.body.boRadio
		const startDate = req.body.startDate
		const prize = req.body.prize
		const description = req.body.description

		if (
			req.user.tournaments.find(
				(tour) =>
					tour.owned &&
					compareAsc(add(new Date(), { hours: 3, minutes: 30 }), tour.startDate) === -1
			)
		) {
			req.flash('error', 'You already have an ongoing tounament!')
			return res.status(403).redirect('/tournaments')
		}
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
			return res.status(422).render('tournaments', {
				pageTitle: 'SirVana · مسابقات',
				path: '/tournaments',
				oldInput: oldInput,
				tournaments: modifiedTournaments,
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
				prizeMessage: prizeMessage,
				nameMessage: nameMessage,
				dateMessage: dateMessage,
				rankMessage: rankMessage,
				page: { multiple: false },
				hasTour: false,
			})
		}
		const imageUrl = req.file ? req.file.path.replace('\\', '/') : 'img/tourcards.png'

		const tournament = new Tournament({
			name: name,
			prize: prize,
			description: description,
			imageUrl: imageUrl,
			startDate: add(new Date(startDate), { hours: 3, minutes: 30 }),
			bo3: boRadio === 'true',
			minMMR: minMMR,
			maxMMR: maxMMR,
			organizer: {
				userId: req.user._id,
				name: req.user.name,
			},
		})
		const createdTournament = await tournament.save()
		await req.user.joinToTour(tournament, 'Organizer')
		res.status(201).redirect('/tournament/' + createdTournament._id)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postEditTournament = async (req, res, next) => {
	try {
		if (
			!req.user.tournaments.find(
				(tour) => tour.owned && tour.tournamentId.toString() === req.body.tournamentId
			)
		) {
			const error = new Error('شما سازنده این مسابقه نیستید')
			error.statusCode = 403
			throw error
		}
		const errors = validationResult(req).array()
		if (errors.length > 0) {
			return res.status(422).send({ status: '422', errors: errors })
		}
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
		// console.log(games)
		const tournament = await Tournament.findById(req.body.tournamentId)
		tournament.name = name
		tournament.prize = prize
		tournament.teamCount = teamCount
		tournament.description = description
		tournament.bo3 = bo3
		tournament.minMMR = minMMR
		tournament.maxMMR = maxMMR
		tournament.games = games

		let updateTeamObj = { 'tournaments.$.name': name },
			updateUserObj = { 'tournaments.$.name': name }
		if (imageUrl) {
			const fileError = fileHelper.deleteFile(tournament.imageUrl)
			if (fileError) throw fileError
			tournament.imageUrl = imageUrl
			updateTeamObj = { ...updateTeamObj, 'tournaments.$.imageUrl': imageUrl }
			updateUserObj = { ...updateUserObj, 'tournaments.$.imageUrl': imageUrl }
		}
		if (startDate) {
			tournament.startDate = add(new Date(startDate), { hours: 3, minutes: 30 })
			updateUserObj = { ...updateUserObj, 'tournaments.$.startDate': startDate }
		}
		// console.log(updatedTournament)
		await tournament.save()
		await User.updateMany(
			{ 'tournaments.tournamentId': req.body.tournamentId },
			{ $set: updateUserObj }
		)
		await Team.updateMany(
			{ 'tournaments.tournamentId': req.body.tournamentId },
			{ $set: updateTeamObj }
		)
		res.status(200).send({ status: '200', imageUrl: tournament.imageUrl })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.getPlayers = async (req, res, next) => {
	try {
		const lft = req.query.lft === 'on'
		const minMMR = req.minMMR
		const maxMMR = req.maxMMR
		const searchInput = req.query.search
		const pos = req.query.pos
		const page = Number(req.query.p || 1)
		const query = prevQuery(req.originalUrl.split('?')[1])

		let dbQuery = {}
		if (searchInput !== '') dbQuery.name = { $regex: new RegExp(`.*${searchInput}.*`, 'i') }
		if (minMMR || maxMMR) dbQuery.mmr = {}
		if (minMMR) dbQuery.mmr.$gte = rank.giveNumber(minMMR)
		if (maxMMR) dbQuery.mmr.$lte = rank.giveNumber(maxMMR)
		if (pos) dbQuery.pos = { $regex: new RegExp(`${pos}`) }
		if (lft) dbQuery.lft = lft

		const playersCount = await User.countDocuments(dbQuery)
		const users = await User.find(dbQuery)
			.skip((page - 1) * PLAYER_PER_PAGE)
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
		res.status(200).render('players', {
			pageTitle: 'SirVana · بازیکنان',
			users: modifiedUsers,
			searchInput: searchInput,
			minMMR: rank.giveMedal(minMMR),
			maxMMR: rank.giveMedal(maxMMR),
			pos: pos,
			lft: lft,
			query: '?' + query + '&',
			page: {
				multiple: playersCount > PLAYER_PER_PAGE,
				current: page,
				last: Math.ceil(playersCount / PLAYER_PER_PAGE),
				hasPrev: page > 1,
				prev: page - 1,
				hasNext: page < Math.ceil(playersCount / PLAYER_PER_PAGE),
				next: page + 1,
			},
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		next(error)
	}
}

exports.postSearchResult = async (req, res, next) => {
	try {
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
		res.status(200).send({ searchResult: searchResult, searchType: searchType })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.getLfMessages = async (req, res, next) => {
	try {
		const messages = await Message.find().sort('createdAt').limit(20)
		res.status(200).send({ messages: messages })
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}

exports.postLfMessages = async (req, res, next) => {
	try {
		const recievedMsg = req.body
		let message
		if (recievedMsg.type === 'lfp') {
			const sender = req.user.ownedTeam
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
		res.status(201).sendStatus(200)
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		res.status(error.statusCode).send({ status: '' + error.statusCode, errors: error })
	}
}
