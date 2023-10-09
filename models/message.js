const mongoose = require('mongoose')

const Schema = mongoose.Schema

const messageSchema = new Schema(
	{
		sender: {
			userId: {
				type: Schema.Types.ObjectId,
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
		type: {
			type: String,
			require: true,
		},
		// expireAt: {
		// 	type: Date,
		// 	default: new Date(),
		// 	index: { expires: '1d' },
		// 	required: true,
		// },
	},
	{ timestamps: true }
)

// messageSchema.index({ createdOn: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 * 3 })

module.exports = mongoose.model('Message', messageSchema)
