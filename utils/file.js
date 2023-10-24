const fs = require('fs')

exports.deleteFile = (path) => {
	if (process.platform === 'win32') {
		path = path.replace('/', '\\')
	}
	fs.unlink(path, (err) => {
		if (err) return err
		console.log('*** image deleted ***')
	})
}
