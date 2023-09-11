exports.getIndex = (req, res, next) => {
	res.render('index', {
		pageTitle: 'SirVana',
	})
}

exports.getTeams = (req, res, next) => {
	res.render('teams', {
		pageTitle: 'SirVana · تیم ها',
	})
}

exports.getTournaments = (req, res, next) => {
	res.render('tournaments', {
		pageTitle: 'SirVana · مسابقات',
	})
}

exports.getRahimi = (req, res, next) => {
	res.render('rahimi', {
		pageTitle: 'SirVana · هوش مصنوعی',
	})
}
