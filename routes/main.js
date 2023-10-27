const express = require('express')

const mainController = require('../controllers/main')
const dashboardController = require('../controllers/dashboard')
const validator = require('../middlewares/validation')
const isAuth = require('../middlewares/isAuth')

const Router = express.Router()

// / => GET
Router.get('/', mainController.getIndex)

// /teams => GET
Router.get('/teams', validator.getTeams, mainController.getTeams)

// /team/:teamId => GET
Router.get('/team/:teamId', mainController.getTeam)

// /team => POST
Router.post('/team', isAuth, validator.postTeam, mainController.postTeam)

// /edit-team => POST
Router.post('/edit-team', isAuth, validator.postEditTeam, mainController.postEditTeam)

// /team-chat => POST
Router.post('/team-chat', isAuth, mainController.postTeamChat)

// /tournaments => GET
Router.get('/tournaments', validator.getTournaments, mainController.getTournaments)

// /tournament/:tournamentId => GET
Router.get('/tournament/:tournamentId', mainController.getTournament)

// /tournament => POST
Router.post('/tournament', isAuth, validator.postTournament, mainController.postTournament)

// /edit-tournament => POST
Router.post(
	'/edit-tournament',
	isAuth,
	validator.postEditTournament,
	mainController.postEditTournament
)

// /players => GET
Router.get('/players', validator.getPlayers, mainController.getPlayers)

// /player/:userId => GET
Router.get('/player/:userId', dashboardController.getDashboard)

// /searchResult => POST
Router.post('/search-result', mainController.postSearchResult)

// /lfMessages => GET
Router.get('/lf-messages', mainController.getLfMessages)

// /lfMessage => POST
Router.post('/lf-message', isAuth, mainController.postLfMessages)

// /rahimi-ai => GET
Router.get('/rahimi-ai', mainController.getRahimi)

module.exports = Router
