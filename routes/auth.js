const express = require('express')

const authController = require('../controllers/auth')
const validator = require('../middlewares/validation')
const isNotAuth = require('../middlewares/isNotAuth')

const Router = express.Router()

// /auth/ => GET
Router.get('/', isNotAuth, authController.getLogin)

// /auth/login => POST
Router.post('/login', isNotAuth, validator.postLogin, authController.postLogin)

// /auth/signup => POST
Router.post('/signup', isNotAuth, validator.postSignup, authController.postSignup)

// /auth/logout => POST
Router.post('/logout', authController.postLogout)

// /auth/reset-password => GET
Router.post('/reset-password', isNotAuth, validator.postResetPass, authController.postResetPass)

// /auth/new-password/:resetToken => GET
Router.post('/new-password', isNotAuth, authController.getNewPass)

// /auth/new-password => POST
Router.post('/new-password', validator.postNewPass, authController.postNewPass)

module.exports = Router
