module.exports = (req, res, next) => {
	if (req.session.isLoggedIn) return next()
	res.redirect('/auth/')
}
