const mongoose = require('mongoose')
const { format } = require('date-fns-tz')
const { add } = require('date-fns')

const Schema = mongoose.Schema

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},

		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		lft: {
			type: Boolean,
			require: true,
			default: false,
		},
		dota2Id: {
			type: Number,
			// required: true,
		},
		ownedTeam: {
			teamId: {
				type: Schema.Types.ObjectId,
				ref: 'Team',
				require: true,
			},
			name: {
				type: String,
				require: true,
			},
			imageUrl: String,
		},
		teams: {
			type: [
				{
					teamId: {
						type: Schema.Types.ObjectId,
						ref: 'Team',
						require: true,
					},
					name: {
						type: String,
						require: true,
					},
					imageUrl: String,
				},
			],
			default: [],
		},
		tournaments: {
			type: [
				{
					tournamentId: {
						type: Schema.Types.ObjectId,
						ref: 'Tournament',
						require: true,
					},
					name: {
						type: String,
						require: true,
					},
					imageUrl: String,
					owned: {
						type: Boolean,
						require: true,
					},
				},
			],
			default: [],
		},
		roles: {
			type: [String],
			default: ['Player'],
		},
		pos: {
			type: [String],
			default: [],
		},
		bio: String,
		discordId: String,
		imageUrl: {
			type: String,
			default: 'img/default-player-dash.jpg',
		},
		mmr: {
			type: Number,
			default: 0,
		},
		lfMsgCd: Number,
		mails: {
			type: [
				{
					inComming: {
						type: Boolean,
						require: true,
					},
					content: {
						type: String,
						require: true,
					},
					responsor: {
						userId: {
							type: Schema.Types.ObjectId,
							ref: 'User',
							require: true,
						},
						name: {
							type: String,
							required: true,
						},
					},
					sentAt: {
						type: Date,
						require: true,
					},
				},
			],
			default: [],
		},
		chatFriends: {
			type: [
				{
					userId: {
						type: Schema.Types.ObjectId,
						ref: 'User',
						require: true,
					},
					name: {
						type: String,
						require: true,
					},
					imageUrl: String,
					seen: {
						type: Boolean,
						default: true,
					},
				},
			],
			default: [],
		},
		requests: {
			type: [
				{
					type: {
						//  out: 'join', 'recruit', 'joinTour'/ in: 'teamRemoved', 'accPlayer', 'accRecruit', 'accTeam'
						type: String,
						require: true,
					},
					state: String,
					relativeReq: Object,
					receiver: {
						id: Schema.Types.ObjectId,
						name: String,
					},
					sender: {
						id: Schema.Types.ObjectId,
						name: String,
					},
					sentAt: {
						type: Date,
						require: true,
					},
				},
			],
			default: [],
		},
		feeds: {
			type: [
				{
					content: {
						type: String,
						require: true,
					},
					comments: [
						{
							sender: {
								userId: {
									type: Schema.Types.ObjectId,
									ref: 'User',
									require: true,
								},
								name: {
									type: String,
									required: true,
								},
							},
							content: {
								type: String,
								require: true,
							},
							sentAt: {
								type: Date,
								require: true,
							},
						},
					],
					sentAt: {
						type: Date,
						require: true,
					},
				},
			],
			default: [],
		},
	},
	{ timestamps: true }
)

userSchema.methods.sendFeed = function (feedContent) {
	let updatedFeeds
	const newFeed = {
		content: feedContent,
		comments: [],
		sendAt: add(new Date(), { hours: 3, minutes: 30 }),
	}
	if (this.feeds) {
		updatedFeeds = [...this.feeds, newFeed]
	} else {
		updatedFeeds = [newFeed]
	}
	this.feeds = updatedFeeds
	console.log(this.feeds)
	// return
	return this.save()
}

userSchema.methods.sendFeedComment = function (commentContent, receiver, feedId) {
	const feedIndex = receiver.feeds.findIndex((feed) => feed._id.toString() === feedId)
	if (feedIndex === -1) {
		return Promise.reject('No feed to send the comment for!')
	}
	const updatedFeeds = [
		...receiver.feeds.slice(0, feedIndex),
		{
			content: receiver.feeds[feedIndex].content,
			sentAt: receiver.feeds[feedIndex].sendAt,
			comments: [
				...receiver.feeds[feedIndex].comments,
				{
					content: commentContent,
					sentAt: add(new Date(), { hours: 3, minutes: 30 }),
					sender: { userId: this._id, name: this.name },
				},
			],
		},
		...receiver.feeds.slice(feedIndex + 1),
	]
	receiver.feeds = updatedFeeds
	return receiver.save()
}

userSchema.methods.sendMail = async function (responsor, mailContent, inChat) {
	if (!this.mails) this.mails = []
	const newMessage = {
		inComming: false,
		content: mailContent,
		responsor: { userId: responsor._id, name: responsor.name },
		sentAt: add(new Date(), { hours: 3, minutes: 30 }),
	}
	const updatedMails = [...this.mails, newMessage]
	this.mails = updatedMails

	if (!this.chatFriends.find((friend) => friend.userId.toString() === responsor._id.toString()))
		this.chatFriends = [
			...this.chatFriends,
			{ userId: responsor._id, name: responsor.name, imageUrl: responsor.imageUrl, seen: true },
		]

	if (!responsor.mails) responsor.mails = []
	const updatedMails2 = [
		...responsor.mails,
		{
			inComming: true,
			content: mailContent,
			responsor: { userId: this._id, name: this.name },
			sentAt: add(new Date(), { hours: 3, minutes: 30 }),
		},
	]
	responsor.mails = updatedMails2

	const friendIndex = responsor.chatFriends.findIndex(
		(friend) => friend.userId.toString() === this._id.toString()
	)
	if (friendIndex === -1)
		responsor.chatFriends = [
			...responsor.chatFriends,
			{ userId: this._id, name: this.name, imageUrl: this.imageUrl, seen: false },
		]
	else responsor.chatFriends[friendIndex].seen = inChat
	await responsor.save()
	this.save()
	return { ...newMessage, sentAt: format(new Date(), 'd.M.yyyy - HH:mm') }
}

userSchema.methods.joinToTeam = function (team, role) {
	if (role) {
		let updatedRoles
		if (this.roles.includes(role)) {
			updatedRoles = [...this.roles]
		} else {
			updatedRoles = [...this.roles, role]
		}
		this.roles = updatedRoles
		this.ownedTeam = {
			teamId: team._id,
			name: team.name,
			imageUrl: team.imageUrl,
		}
	} else {
		if (!this.teams) this.teams = []
		const updatedTeams = [
			...this.teams,
			{ teamId: team._id, name: team.name, imageUrl: team.imageUrl },
		]
		this.teams = updatedTeams
		let updatedTournaments
		if (this.tournaments) {
			const newTeamTournaments = team.tournaments.filter((tournament) => {
				const sameTournament = this.tournaments.find(
					(tour) => tour.tournamentId === tournament.tournamentId
				)
				if (sameTournament) return false
				tournament = { ...tournament, owned: role ? true : false }
				return true
			})
			updatedTournaments = [...this.tournaments, ...newTeamTournaments]
		} else {
			updatedTournaments = [...team.tournaments]
		}
		this.tournaments = updatedTournaments
	}
	return this.save()
}

userSchema.methods.joinToTour = function (tournament) {
	const owned = tournament.organizer.userId.toString() === this._id.toString()
	let updatedTournaments
	const newTour = {
		tournamentId: tournament._id,
		name: tournament.name,
		imageUrl: tournament.imageUrl,
		owned: owned,
	}
	if (this.tournaments) {
		updatedTournaments = [...this.tournaments, newTour]
	} else {
		updatedTournaments = [newTour]
	}
	this.tournaments = updatedTournaments

	return this.save()
}

userSchema.methods.leaveTour = function (tournamentId) {
	this.tournaments = this.tournaments.filter(
		(tour) => tour.tournamentId.toString() !== tournamentId.toString()
	)
	return this.save()
}

userSchema.methods.createTour = function (tournament, role) {
	let updatedRoles
	if (this.roles.includes(role)) {
		updatedRoles = [...this.roles]
	} else {
		updatedRoles = [...this.roles, role]
	}
	this.roles = updatedRoles

	let updatedTournaments
	if (this.tournaments) {
		updatedTournaments = [
			...this.tournaments,
			{ tournamentId: tournament._id, name: tournament.name, joined: false },
		]
	} else {
		updatedTournaments = [{ tournamentId: tournament._id, name: tournament.name, joined: false }]
	}
	this.tournaments = updatedTournaments

	return this.save()
}

userSchema.methods.handleReq = async function (reqId, responsorUser, relativeReqId, state) {
	let deleteReq
	responsorUser.requests.forEach((req) => {
		if (req._id.toString() === relativeReqId) deleteReq = req.type
	})
	const updatedRequests = this.requests.filter((req) => {
		if (req._id.toString() === reqId) {
			if (req.state === 'Unseen') deleteReq = 'Unseen'
			return false
		}
		return true
	})
	if (this.requests.length === updatedRequests.length) return 'wrong'
	if (deleteReq) {
		let updatedRequestss,
			changed = false
		switch (deleteReq) {
			case 'Unseen':
				updatedRequestss = responsorUser.requests.filter((req) => {
					if (req.relativeReq.reqId == undefined || req.relativeReq.reqId.toString() !== reqId)
						return true
					changed = true
					return false
				})
				break
			case 'join':
			case 'recruit':
			case 'joinTour':
				updatedRequestss = responsorUser.requests.map((req) => {
					let updatedReq = { ...req._doc }
					if (req._id.toString() === relativeReqId) {
						updatedReq.state = state
						changed = true
					}
					return updatedReq
				})
				break
		}
		// console.log(responsorUser.requests.length === updatedRequestss.length)
		if (!changed) return 'wrong'
		responsorUser.requests = updatedRequestss
		await responsorUser.save()
	}
	this.requests = updatedRequests
	return this.save()
}

userSchema.methods.exchangeReq = async function (type, receiver, sender, relativeReq) {
	let newReq
	if (type === 'recruit' || type === 'joinTour' || type === 'join') {
		// checks if request is duplicate
		if (
			this.requests.find(
				(req) => req.type === type && req.receiver.id.toString() === receiver._id.toString()
			)
		)
			return
		newReq = {
			type: type,
			state: 'Unseen',
			relativeReq: relativeReq,
			receiver: {
				id: receiver._id,
				name: receiver.name,
			},
			sentAt: add(new Date(), { hours: 3, minutes: 30 }),
		}
	} else {
		// checks if request is duplicate
		if (
			this.requests.find(
				(req) => req.type === type && req.sender.id.toString() === sender._id.toString()
			)
		)
			return
		newReq = {
			type: type,
			relativeReq: relativeReq,
			sender: {
				id: sender._id,
				name: sender.name,
			},
			sentAt: add(new Date(), { hours: 3, minutes: 30 }),
		}
		if (receiver)
			newReq.receiver = {
				id: receiver._id,
				name: receiver.name,
			}
	}
	const updatedReqs = [...this.requests, newReq]
	this.requests = updatedReqs
	await this.save()
	return this.requests.slice(-1)[0]._id
}

module.exports = mongoose.model('User', userSchema)
