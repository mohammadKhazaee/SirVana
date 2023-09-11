const express = require('express')

const mainController = require('../controllers/main')

const Router = express.Router()

// / => GET
Router.get('/', mainController.getIndex)

// /teams => GET
Router.get('/teams', mainController.getTeams)

// /tournament => GET
Router.get('/tournaments', mainController.getTournaments)

// /rahimi-ai => GET
Router.get('/rahimi-ai', mainController.getRahimi)

module.exports = Router
