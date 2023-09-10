const fs = require('fs')

exports.deleteFile = (path) => {
	path = path.substring(1)
	path = path.replace('/', '\\')
	fs.unlink(path, (err) => {
		if (err) throw err
		console.log('*** image deleted ***')
	})
}
