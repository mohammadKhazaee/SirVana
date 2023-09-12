const mongoose = require('mongoose')

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
		description: {
			type: String,
			required: true,
		},
		imageUrl: String,
		leader: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		lfp: {
			type: Boolean,
			require: true,
		},
		members: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		avgMMR: Number,
		tournaments: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Tournament',
			},
		],
	},
	{ timestamps: true }
)

module.exports = mongoose.model('Team', teamSchema)
