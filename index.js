const request = require('request')
const url = 'https://www.simple.co/api/gestion/authorization/gestion/CC106501489'
const loginUrl = 'https://www.simple.co/auth/login'

//pass-login

//simple
request.post({
  rejectUnauthorized: false,
  headers: { 'Content-Type': 'application/json', 'Content-Length': 59, 'Origin': 'https://www.simple.co', 'User-Agent': 'Chrome/91.0.4472.114' },
  url: loginUrl,
  body: {
    captcha: "",
    contrasena: "2021",
    usuario: "CC1065014890"
  },
  json: true
}, function (error, response, html) {
  //console.log(error)
  console.log(response)
});
