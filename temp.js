const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
	service: 'gmail',
	port: 465,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAIL_PASSWORD,
	},
})

transporter.sendMail({
	to: email,
	from: `${process.env.EMAIL}`,
	subject: 'Password reset',
	html: `
		<p>You requested a password reset</p>
		<p>Click this <a href="http://localhost:3000/auth/new-password/${token}">link</a> to set a new password</p>
	`,
})

const emailFarshad = 'fshdtaraki1@gmail.com'
const farshadGithub = 'git@github.com:fshd1-front/Sirvana.git'

const myEmail = 'm.khazaee.p@gmail.com'

const prettierSetting = {
	'workbench.colorTheme': 'Default Dark+',
	'workbench.iconTheme': 'material-icon-theme',
	'workbench.startupEditor': 'none',
	'html.format.indentHandlebars': true,
	'html.format.indentInnerHtml': true,
	'javascript.inlayHints.propertyDeclarationTypes.enabled': true,
	'editor.formatOnSave': true,
	'editor.formatOnPaste': true,
	'editor.defaultFormatter': 'esbenp.prettier-vscode',
	'[javascript]': {
		'editor.defaultFormatter': 'esbenp.prettier-vscode',
	},
	'editor.fontWeight': 'normal',
	'prettier.tabWidth': 4,
	'prettier.useTabs': true,
	'explorer.confirmDelete': false,
	'workbench.editor.untitled.hint': 'hidden',
	'terminal.integrated.tabs.enabled': false,
	'tabnine.experimentalAutoImports': true,
	'terminal.integrated.defaultProfile.windows': 'Git Bash',
	'[html]': {
		'editor.defaultFormatter': 'vscode.html-language-features',
	},
	'editor.indentSize': 'tabSize',
}

// select and populate examples
// find().select('title price -_id')
// .populate('userId', 'name')
