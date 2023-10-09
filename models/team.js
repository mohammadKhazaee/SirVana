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
		imageUrl: String,
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
	if (this.members) {
		updatedMembers = [...this.members, { userId: user._id, name: user.name }]
	} else {
		updatedMembers = [{ userId: user._id, name: user.name }]
	}
	this.members = updatedMembers
	return this.save()
}

teamSchema.methods.joinToTournament = function (tournament) {
	const updatedTournaments = [
		...this.tournaments,
		{
			tournamentId: tournament._id,
			name: tournament.name,
			image: tournament.imageUrl,
		},
	]
	this.tournaments = updatedTournaments

	this.members.forEach(async (player) => {
		const playerDoc = await User.findById(player.userId)
		await playerDoc.joinToTour(tournament)
	})

	return this.save()
}

module.exports = mongoose.model('Team', teamSchema)
