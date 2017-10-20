const nodemailer = require('nodemailer'),
  options = require('../config/email.json'),
  host = require('../config/host.json')

let transporter = nodemailer.createTransport(options)

module.exports = {
  verify: () => {
    transporter.verify((error, success) => {
      if (error) {
        console.log(error)
      } else {
        console.log('Server is ready to take our messages')
      }
    })
  },
  sendSignupEmail: (user) => {
    let message = {
      from: options.auth.user,
      to: user.email,
      subject: 'Bienvenue sur Task',
      text: "Félications, plus qu'une étape pour confirmer votre adresse email, veuillez copier coller ce lien " + host.baseUrl + "/users/confirmation/" + user.emailConfirmationToken + "dans votre navigateur",
      html: "<p>Félications, plus qu'une étape pour confirmer votre adresse email, veuillez cliquer <a href=\"" + host.baseUrl + "/users/confirmation/" + user.emailConfirmationToken + "\">ici</a></p><p>Si cette email ne vous êtiez pas destiné, merci de l'ignorer.</p>"
    }
    return new Promise(function(resolve, reject) {
      transporter.sendMail(message, function(err) {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }
}
