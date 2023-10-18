const mongoose = require('mongoose')

const Schema = mongoose.Schema

const socketSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		require: true,
	},
	friendId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		require: true,
	},
	socketId: {
		type: String,
		require: true,
	},
	type: {
		type: String,
		require: true,
	},
})

module.exports = mongoose.model('Socket', socketSchema)
