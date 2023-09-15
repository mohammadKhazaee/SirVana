const express = require('express')

const mainController = require('../controllers/main')
const validator = require('../middlewares/validation')

const Router = express.Router()

// / => GET
Router.get('/', mainController.getIndex)

// /teams => GET
Router.get('/teams', validator.getTeams, mainController.getTeams)

// /team => POST
Router.post('/team', validator.postTeam, mainController.postTeam)

// /tournaments => GET
Router.get('/tournaments', validator.getTournaments, mainController.getTournaments)

// /tournament => POST
Router.post('/tournament', validator.postTournament, mainController.postTournament)

// /searchResult => POST
Router.post('/search-result', mainController.postSearchResult)

// /rahimi-ai => GET
Router.get('/rahimi-ai', mainController.getRahimi)

module.exports = Router
