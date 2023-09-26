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
				image: String,
			},
		],
		tournaments: {
			type: [
				{
					tournamentId: {
						type: Schema.Types.ObjectId,
						ref: 'Tournament',
					},
					name: {
						type: String,
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
		discordId: String,
		imageUrl: String,
		mmr: {
			type: Number,
			default: 0,
		},
		lfMsgCd: Number,
		// messages: [
		// 	{
		// 		msgType: {
		// 			type: String,
		// 			require: true,
		// 		},
		// 		inComming: {
		// 			type: Boolean,
		// 			require: true,
		// 		},
		// 		content: {
		// 			type: String,
		// 			require: true,
		// 		},
		// 		responsor: {
		// 			userId: {
		// 				type: Schema.Types.ObjectId,
		// 				ref: 'User',
		// 				require: true,
		// 			},
		// 			name: {
		// 				type: String,
		// 				required: true,
		// 			},
		// 			relatedName: String,
		// 		},
		// 		sentAt: {
		// 			type: Date,
		// 			require: true,
		// 		},
		// 	},
		// ],
		requests: [
			{
				type: {
					//  out: 'join', 'recruit', 'joinTour'/ in: 'accPlayer', 'accRecruit', 'accTeam'
					type: String,
					require: true,
				},
				state: String,
				reciever: {
					id: String,
					name: String,
				},
				sender: {
					id: String,
					name: String,
				},
				sentAt: {
					type: Date,
					require: true,
				},
			},
		],
	},
	{ timestamps: true }
)

userSchema.methods.joinToTeam = function (team, role) {
	if (role) {
		let updatedRoles
		if (this.roles.includes(role)) {
			updatedRoles = [...this.roles]
		} else {
			updatedRoles = [...this.roles, role]
		}
		this.roles = updatedRoles
	}
	if (!this.teams) this.teams = []
	const updatedTeams = [...this.teams, { teamId: team._id, name: team.name, image: team.imageUrl }]
	this.teams = updatedTeams

	let updatedTournaments
	if (this.tournaments) {
		const newTeamTournaments = team.tournaments.filter((tournament) => {
			const sameTournament = this.tournaments.find((tour) =>
				tour.tournamentId === tournament.tournamentId ? true : false
			)
			if (sameTournament) return false
			return true
		})
		updatedTournaments = [...this.tournaments, ...newTeamTournaments]
	} else {
		updatedTournaments = [...team.tournaments]
	}
	this.tournaments = updatedTournaments

	return this.save()
}

userSchema.methods.exchangeReq = function (type, reciever, sender) {
	let newReq
	if (type === 'recruit' || type === 'joinTour') {
		newReq = {
			type: type,
			state: 'Unseen',
			reciever: {
				id: reciever._id,
				name: reciever.name,
			},
			sender: {
				id: sender._id,
				name: sender.name,
			},
			sentAt: new Date(),
		}
	} else if (type === 'join') {
		newReq = {
			type: type,
			state: 'Unseen',
			reciever: {
				id: reciever._id,
				name: reciever.name,
			},
			sender: {
				id: sender._id,
				name: sender.name,
			},
			sentAt: new Date(),
		}
	} else if (type === 'accPlayer' || type === 'accTeam') {
		newReq = {
			type: type,
			reciever: {
				id: reciever._id,
				name: reciever.name,
			},
			sentAt: new Date(),
		}
	} else {
		newReq = {
			type: type,
			sender: {
				id: sender._id,
				name: sender.name,
			},
			sentAt: new Date(),
		}
	}
	const updatedReqs = [...this.requests, newReq]
	this.requests = updatedReqs
	console.log(this)
	return this.save()
}

module.exports = mongoose.model('User', userSchema)
