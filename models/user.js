const mongoose = require('mongoose')

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
		teams: [
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
		mails: [
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
		requests: [
			{
				type: {
					//  out: 'join', 'recruit', 'joinTour'/ in: 'accPlayer', 'accRecruit', 'accTeam'
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
		feeds: [
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
	},
	{ timestamps: true }
)

userSchema.methods.sendFeed = function (feedContent) {
	let updatedFeeds
	if (this.feeds) {
		updatedFeeds = [
			...this.feeds,
			{
				content: feedContent,
				comments: [],
				sentAt: new Date(),
			},
		]
	} else {
		updatedFeeds = [{ content: feedContent, comments: [], sendAt: new Date() }]
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
					sentAt: new Date(),
					sender: { userId: this._id, name: this.name },
				},
			],
		},
		...receiver.feeds.slice(feedIndex + 1),
	]
	receiver.feeds = updatedFeeds
	return receiver.save()
}

userSchema.methods.sendMail = function (responsor, mailContent) {
	if (!this.mails) this.mails = []
	const updatedMails = [
		...this.mails,
		{
			inComming: false,
			content: mailContent,
			responsor: { userId: responsor._id, name: responsor.name },
			sentAt: new Date(),
		},
	]
	this.mails = updatedMails
	if (!responsor.mails) responsor.mails = []
	const updatedMails2 = [
		...responsor.mails,
		{
			inComming: true,
			content: mailContent,
			responsor: { userId: this._id, name: this.name },
			sentAt: new Date(),
		},
	]
	responsor.mails = updatedMails2
	responsor.save()
	return this.save()
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
			{ teamId: team._id, name: team.name, image: team.imageUrl },
		]
		this.teams = updatedTeams

		let updatedTournaments
		if (this.tournaments) {
			const newTeamTournaments = team.tournaments.filter((tournament) => {
				const sameTournament = this.tournaments.find(
					(tour) => tour.tournamentId === tournament.tournamentId
				)
				if (sameTournament) return false
				tournament = { ...tournament, joined: true }
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
	const joined = tournament.leader.userId.toString() !== this._id.toString()
	let updatedTournaments
	if (this.tournaments) {
		updatedTournaments = [
			...this.tournaments,
			{ tournamentId: tournament._id, name: tournament.name, joined: joined },
		]
	} else {
		updatedTournaments = [{ tournamentId: tournament._id, name: tournament.name, joined: joined }]
	}
	this.tournaments = updatedTournaments

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
			receiver: {
				id: receiver._id,
				name: receiver.name,
			},
			sentAt: new Date(),
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
			sentAt: new Date(),
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
