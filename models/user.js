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
		dotaId: {
			type: String,
			require: true,
		},
		password: {
			type: String,
			required: true,
		},
		lft: {
			type: Boolean,
			require: true,
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
		roles: [String],
		pos: [String],
		mmr: Number,
	},
	{ timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
