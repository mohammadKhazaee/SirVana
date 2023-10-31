const mongoose = require('mongoose')

const User = require('./user')

const Schema = mongoose.Schema

const teamSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		nameTag: {
			type: String,
			required: true,
		},
		description: String,
		imageUrl: {
			type: String,
			default: 'img/default-team-picture.jpg',
		},
		leader: {
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
		members: [
			{
				userId: {
					type: Schema.Types.ObjectId,
					ref: 'User',
					require: true,
				},
				name: {
					type: String,
					required: true,
				},
				imageUrl: String,
				pos: String,
				isLead: {
					type: Boolean,
					default: false,
				},
			},
		],
		memberCount: { type: Number, default: 1 },
		avgMMR: { type: Number, default: 0 },
		lfp: {
			type: Boolean,
			require: true,
		},
		tournaments: [
			{
				tournamentId: {
					type: Schema.Types.ObjectId,
					ref: 'Tournament',
				},
				name: {
					type: String,
					required: true,
				},
				imageUrl: String,
			},
		],
		chats: [
			{
				content: {
					type: String,
					require: true,
				},
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
				sentAt: {
					type: Date,
					require: true,
				},
			},
		],
	},
	{ timestamps: true }
)

teamSchema.methods.recruitMember = function (user) {
	const updatedAvgMMR = (this.avgMMR * this.memberCount + user.mmr) / (this.memberCount + 1)
	this.avgMMR = updatedAvgMMR
	this.memberCount = this.memberCount + 1
	let updatedMembers
	const newMember = { userId: user._id, name: user.name, imageUrl: user.imageUrl }
	newMember.pos = user.pos.join('-')
	if (newMember.pos === '1-2-3-4-5') newMember.pos = 'همه'
	if (newMember.pos === '') newMember.pos = 'ثبت نشده'
	if (this.members) {
		updatedMembers = [...this.members, newMember]
	} else {
		updatedMembers = [newMember]
	}
	this.members = updatedMembers
	return this.save()
}

teamSchema.methods.leaveTournament = function (tournamentId, organizerId) {
	this.tournaments = this.tournaments.filter(
		(tour) => tour.tournamentId.toString() !== tournamentId.toString()
	)

	this.members.forEach(async (player) => {
		if (player.userId.toString() !== organizerId.toString()) {
			const playerDoc = await User.findById(player.userId)
			await playerDoc.leaveTour(tournamentId)
		}
	})

	return this.save()
}

teamSchema.methods.joinToTournament = function (tournament, organizerId) {
	const updatedTournaments = [
		...this.tournaments,
		{
			tournamentId: tournament._id,
			name: tournament.name,
			imageUrl: tournament.imageUrl,
		},
	]
	this.tournaments = updatedTournaments

	this.members.forEach(async (player) => {
		if (!organizerId || (organizerId && organizerId !== player.userId.toString())) {
			const playerDoc = await User.findById(player.userId)
			await playerDoc.joinToTour(tournament)
		}
	})

	return this.save()
}

module.exports = mongoose.model('Team', teamSchema)
