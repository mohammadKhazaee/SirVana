const Schema = mongoose.Schema

const tournametSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		prize: {
			type: String,
			required: true,
		},
		description: String,
		imageUrl: String,
		startDate: { type: Date, require: true },
		minMmr: Number,
		maxMmr: Number,
		organizer: {
			type: Schema.Types.ObjectId,
			ref: 'User',
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
