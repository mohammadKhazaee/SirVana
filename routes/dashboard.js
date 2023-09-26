const express = require('express')

const dashboardController = require('../controllers/dashboard')
const validator = require('../middlewares/validation')

const Router = express.Router()

// /dashboard => GET
Router.get('/', dashboardController.getDashboard)

// /join-team => POST
// Router.post('/join-team', mainController.postJoinToTeam)

// /join-team-req => POST
// Router.post('/join-team-req', mainController.postJoinToTeamReq)

module.exports = Router
