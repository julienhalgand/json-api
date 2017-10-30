const reCAPTCHA = require('recaptcha2'),
  recaptcha = new reCAPTCHA({
    siteKey: '6Lc9pSMTAAAAANQhHIJvzhtQ8IpRx8pNo7F71lGn',
    secretKey: '6Lc9pSMTAAAAAB0hccnwoMDW0s_LADmejNWokXrg'
  })

module.exports = recaptcha
