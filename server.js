//node third parties modules and common core modules
const express = require('express');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser');
const corsOptions = require('./app/configuration/corsOptions.js');
require('dotenv').config()
//database connection
//
//--------------- middlewares imports ------------------
const {requestLogger, errorLogger} = require('./app/middleware/logEvents.js');
const errorHandler = require('./app/middleware/errorHandler.js');
//------------------------------------------------------
const PORT = process.env.PORT || 3000;
//----------------middlewares---------------------------
app.use(requestLogger);
app.use(express.json());
app.use(cookieParser())


app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'] // '.html' or 'html' both work
}));

app.use(cors(corsOptions));
//----------------routing-------------------------------
app.use('/scripts', async (req, res) => {
  const urlArray = req.originalUrl.split('/');
  const locator = urlArray[urlArray.length - 1];

  try {
    const file = locator.concat('.', 'js');
    if (!fs.existsSync(path.join(__dirname, 'public', 'assets', 'js', file))) return res.status(404).json({"response": "script-not-found"});
  
    const options = {
    root: path.join('public', 'assets', 'js'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  } 
  
  console.log('works')
  return res.status(200).sendFile(file, options);

  } catch (err) {
    res.status(500).json({'response':'server-error'})
    next(errorCreator(error.message, 'error', __filename))
  }
})
app.use('/upload', require('./app/routes/uploads/uploads.js'));
app.use('/testerror', require('./app/routes/testerror.route.js'));
app.use('/authentication', require('./app/routes/authentication/authentication.route.js'));
app.use('/spotify', require('./app/routes/spotifyauth/spotifyauth.js'))
//----------------error handler-------------------------
app.use(errorLogger)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
