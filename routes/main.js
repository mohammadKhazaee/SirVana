const express = require('express')

const mainController = require('../controllers/main')
const validator = require('../middlewares/validation')

const Router = express.Router()

// / => GET
Router.get('/', mainController.getIndex)

// /teams => GET
Router.get('/teams', validator.getTeams, mainController.getTeams)

// /team/:teamId => GET
Router.get('/team/:teamId', mainController.getTeam)

// /team => POST
Router.post('/team', validator.postTeam, mainController.postTeam)

// /edit-team => POST
Router.post('/edit-team', mainController.postEditTeam)

// /team-chat => POST
Router.post('/team-chat', mainController.postTeamChat)

// /tournaments => GET
Router.get('/tournaments', validator.getTournaments, mainController.getTournaments)

// /tournament/:tournamentId => GET
Router.get('/tournament/:tournamentId', mainController.getTournament)

// /tournament => POST
Router.post('/tournament', validator.postTournament, mainController.postTournament)

// /edit-tournament => POST
Router.post('/edit-tournament', mainController.postEditTournament)

// /players => GET
Router.get('/players', validator.getPlayers, mainController.getPlayers)

// /player => POST
// Router.post('/player', validator.postPlayer, mainController.postPlayer)

// /searchResult => POST
Router.post('/search-result', mainController.postSearchResult)

// /lfMessages => GET
Router.get('/lf-messages', mainController.getLfMessages)

// /lfMessage => POST
Router.post('/lf-message', mainController.postLfMessages)

// /rahimi-ai => GET
Router.get('/rahimi-ai', mainController.getRahimi)

module.exports = Router
