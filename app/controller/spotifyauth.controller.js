const { v4: uuidv4 } =  require('uuid');
const https = require('node:https')
const formUrlEncoded = require('form-urlencoded')
require('dotenv').config()


const spotifyAuthLogin = (req, res) => {
  const scope = "streaming\ user-read-email\ user-read-private"

  const state = uuidv4()
  
  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: "http://127.0.0.1:3000/spotify/auth/callback",
    state: state
  })

  res.redirect("https://accounts.spotify.com/authorize/?"+auth_query_parameters.toString())
}

const spotifyAuthCallback = (req, res) => {
  const code = req.query.code

  const formUrlObj = {
    code: code,
    redirect_uri: "http://127.0.0.1:3000/spotify/auth/callback",
    grant_type: 'authorization_code'
  }

  ////
  const options = {
     method: 'POST', 
     headers: {
      'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
      'Content-Type' : 'application/x-www-form-urlencoded'
     }
  }

  const request = https.request('https://accounts.spotify.com/api/token?'+ formUrlEncoded(formUrlObj), options, (response) => {
    if (response.statusCode === 200) {

      const chuncks = []
      response.on('data', async (data) => {
      chuncks.push(Buffer.from(data))
      
      response.on('end', () => {
        const stringToken = Buffer.concat(chuncks).toString('utf8')
        var access_token = JSON.parse(stringToken);
        console.log(access_token)
        const searchParams = new URLSearchParams({
          a: access_token.access_token,
          r: access_token.refresh_token,
          exp: access_token.expires_in
        })
        res.redirect('http://localhost:5173/portfolio/musicport?'+ searchParams.toString())
      })
    })
    }
  })

  request.end()
}

module.exports = {spotifyAuthLogin, spotifyAuthCallback}