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

// /dashboard/settings => GET
Router.get('/settings', dashboardController.getDashboardSettings)

// /dashboard/edit-profile => POST
Router.post('/edit-profile', validator.postEditProfile, dashboardController.postEditProfile)

// /dashboard/send-feed => POST
Router.post('/send-feed', dashboardController.postSendFeed)

// /dashboard/send-feed-comment => POST
Router.post('/send-feed-comment', dashboardController.postSendFeedComment)

// /dashboard/join-req => POST
Router.post('/join-req', dashboardController.postJoinReq)

// /dashboard/accept-player => POST
Router.post('/accept-player', dashboardController.postAccPlayer)

// /dashboard/reject-player => POST
Router.post('/reject-player', dashboardController.postRejPlayer)

// /dashboard/recruit-req => POST
Router.post('/recruit-req', dashboardController.postRecruitReq)

// /dashboard/accept-recruit => POST
Router.post('/accept-recruit', dashboardController.postAccRecruit)

// /dashboard/reject-recruit => POST
Router.post('/reject-recruit', dashboardController.postRejRecruit)

// /dashboard/join-tour-req => POST
Router.post('/join-tour-req', dashboardController.postJoinTourReq)

// /dashboard/accept-team => POST
Router.post('/accept-team', dashboardController.postAccTeam)

// /dashboard/reject-team => POST
Router.post('/reject-team', dashboardController.postRejTeam)

// /dashboard/remove-from-tour => POST
Router.post('/remove-from-tour', dashboardController.postRemoveTeam)

// /dashboard/delete-req => POST
Router.post('/delete-req', dashboardController.postDeleteReq)

// /dashboard/mail/:friendId => GET
Router.get('/mail/:friendId', dashboardController.getPvMail)

// /dashboard/send-mail => POST
Router.post('/send-mail', dashboardController.postPvMail)

module.exports = Router
