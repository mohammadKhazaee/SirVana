const express = require('express')

const mainController = require('../controllers/main')
const validator = require('../middlewares/validation')

const Router = express.Router()

// / => GET
Router.get('/', mainController.getIndex)

// /teams => GET
Router.get('/teams', validator.getTeam, mainController.getTeams)

// /team => POST
Router.post('/team', validator.postTeam, mainController.postTeam)

// /tournament => GET
Router.get('/tournaments', mainController.getTournaments)

// /rahimi-ai => GET
Router.get('/rahimi-ai', mainController.getRahimi)

module.exports = Router
