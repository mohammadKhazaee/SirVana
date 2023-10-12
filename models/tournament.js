const mongoose = require('mongoose')

const Schema = mongoose.Schema

const tournametSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		prize: {
			type: Number,
			required: true,
		},
		description: String,
		imageUrl: {
			type: String,
			default: 'img/tourcards.png',
		},
		startDate: { type: Date, require: true },
		bo3: {
			type: Boolean,
			require: true,
		},
		minMMR: {
			type: String,
			required: true,
		},
		maxMMR: {
			type: String,
			required: true,
		},
		organizer: {
			userId: {
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
			name: {
				type: String,
				required: true,
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
		},
	},
	{ timestamps: true }
)

tournametSchema.methods.addNewTeam = function (team) {
	const updatedTeams = [
		...this.teams,
		{
			teamId: team._id,
			name: team.name,
			image: team.imageUrl,
		},
	]
	this.teams = updatedTeams
	return this.save()
}

module.exports = mongoose.model('Tournament', tournametSchema)
