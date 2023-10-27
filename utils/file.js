const fs = require('fs')

exports.deleteFile = (path) => {
	if (
		!path ||
		path === 'img/default-player-dash.jpg' ||
		path === 'img/default-team-picture.jpg' ||
		path === 'img/tourcards.png'
	)
		return
	if (process.platform === 'win32') {
		path = path.replace('/', '\\')
	}
	fs.unlink(path, (err) => {
		if (err) return err
		console.log('*** image deleted ***')
	})
}
