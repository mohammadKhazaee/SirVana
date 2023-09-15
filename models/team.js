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
		memberCount: Number,
		avgMMR: Number,
		lfp: {
			type: Boolean,
			require: true,
		},
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
