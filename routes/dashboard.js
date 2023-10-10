const express = require('express')

const dashboardController = require('../controllers/dashboard')
const validator = require('../middlewares/validation')

const Router = express.Router()

// /dashboard => GET
Router.get('/', dashboardController.getDashboard)

// /dashboard/team-tour => GET
Router.get('/team-tour', dashboardController.getDashboardTeam)

// /dashboard/notif => GET
Router.get('/notif', dashboardController.getDashboardNotif)

// /dashboard/edit-profile => POST
Router.post('/edit-profile', dashboardController.postEditProfile)

// /dashboard/send-feed => POST
Router.post('/send-feed', dashboardController.postSendFeed)

// /dashboard/send-feed-comment => POST
Router.post('/send-feed-comment', dashboardController.postSendFeedComment)

// /dashboard/join-req => POST
Router.post('/join-req', dashboardController.postJoinReq)

// /dashboard/accept-player => POST
Router.post('/accept-player', dashboardController.postAccPlayer)

// /dashboard/recruit-req => POST
Router.post('/recruit-req', dashboardController.postReqruitReq)

// /dashboard/accept-recruit => POST
Router.post('/accept-recruit', dashboardController.postAccRecruit)

// /dashboard/join-tour-req => POST
Router.post('/join-tour-req', dashboardController.postJoinTourReq)

// /dashboard/accept-team => POST
Router.post('/accept-team', dashboardController.postAccTeam)

// /dashboard/send-mail => POST
Router.post('/send-mail', dashboardController.postPvMail)

module.exports = Router
