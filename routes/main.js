const express = require('express')

const mainController = require('../controllers/main')

const Router = express.Router()

// / => GET
Router.get('/', mainController.getIndex)

module.exports = Router
