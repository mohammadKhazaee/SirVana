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
		imageUrl: String,
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
		},
		teams: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Team',
			},
		],
	},
	{ timestamps: true }
)

module.exports = mongoose.model('Tournamet', tournametSchema)
