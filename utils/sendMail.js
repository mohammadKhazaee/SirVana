const nodemailer = require('nodemailer')
const { google } = require('googleapis')
require('dotenv').config()

const REDIRECT_URI = 'https://developers.google.com/oauthplayground'

module.exports = async (mailOption) => {
	const oAuth2Client = new google.auth.OAuth2(
		process.env.OAUTH_CLIENT_ID,
		process.env.OAUTH_CLIENT_SECRET,
		REDIRECT_URI
	)
	oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN })
	try {
		const accessToken = await oAuth2Client.getAccessToken()
		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 465,
			secure: true,
			service: 'gmail',
			auth: {
				type: 'OAUTH2',
				user: process.env.EMAIL, //set these in your .env file
				clientId: process.env.OAUTH_CLIENT_ID,
				clientSecret: process.env.OAUTH_CLIENT_SECRET,
				refreshToken: process.env.OAUTH_REFRESH_TOKEN,
				accessToken: accessToken,
			},
		})
		return await transporter.sendMail(mailOption)
	} catch (error) {
		throw error
	}
}
