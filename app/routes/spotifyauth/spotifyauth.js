const express = require('express')
const Router = express.Router()
const {spotifyAuthLogin, spotifyAuthCallback, getToken} = require('../../controller/spotifyauth.controller')

Router.route('/auth/login').
  get(spotifyAuthLogin)
Router.route('/auth/callback').
  get(spotifyAuthCallback)


module.exports = Router