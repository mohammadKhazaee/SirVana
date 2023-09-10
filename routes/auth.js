const express = require('express')

const authController = require('../controllers/auth')
const validator = require('../middlewares/validation')

const Router = express.Router()

// /auth/ => GET
Router.get('/', authController.getLogin)

// /auth/login => POST
Router.post('/login', validator.postLogin, authController.postLogin)

// /auth/signup => POST
Router.post('/signup', validator.postSignup, authController.postSignup)

// /auth/reset-password => GET
Router.post('/reset-password', validator.postResetPass, authController.postResetPass)

module.exports = Router
