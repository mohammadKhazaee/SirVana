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
				type: Schema.Types.ObjectId,
				ref: 'Team',
			},
		],
		tournaments: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Tournament',
			},
		],
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
		mmr: Number,
	},
	{ timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
