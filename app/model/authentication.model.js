//modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const striptags = require('striptags')
const dayjs = require('dayjs');
require('dotenv').config();
//models
const usersDB = require('./mongo.schemas/mongo.schema.users.js')
//regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/;

//----------------------functions---------------

const modelSignUp = async (newUser) => {
  const users = await usersDB.find()

  for (const value of users) {
    if (value.username == newUser.username || value.email == newUser.email) {
      return [409, {'response':'user-duplicated'}];
    }
  }
  
  const hashed = await bcrypt.hash(newUser.password, 10);
    
  newUser.password = hashed
  newUser.datestamp = dayjs().add(30, 'day').unix();
  newUser.roles = {
    User: 2001
  }

  const result = await usersDB.create(newUser);
    
  return [200, {'response':'user-created'}]
}

const modelSignIn = async (username, password) => {
  const users = await usersDB.find()

  const foundUser = users.find(user => {
    if (user.username == username || user.email == username) {
      return user;
    }
  })

  if (!foundUser) return [400, {'response': 'not-found'}]
  
  const currentUnix = dayjs().unix()
  
  if (currentUnix > foundUser.datestamp) return [410, {"response": "pwr-expired"}];

  const currentUnixMinus5 = dayjs().subtract(5, 'minute').unix()
  if (foundUser.attempts < 3 || foundUser.lastattempt < currentUnixMinus5) {
    const match = await bcrypt.compare(password, foundUser.password);

    if (match) {

      const roles = Object.values(foundUser.roles);

      const accessToken = jwt.sign(
        {
          "userInfo": {
            'username': foundUser.username,
            'roles': roles
          }},
        process.env.ACCESS_TOKEN,
        {expiresIn: 900}
      )

      const refreshToken = jwt.sign(
        {"username": foundUser.username},
        process.env.REFRESH_TOKEN,
        {expiresIn: "1d"}
      )

      foundUser.validattempt = currentUnix;
      foundUser.lastattempt = currentUnix;
      foundUser.attempts = 0;
      foundUser.refreshToken = refreshToken;

      const update = foundUser.save()

      if (update) return [200, accessToken, refreshToken];
    } else {
      const lastAttempt = foundUser.lastattempt;
      foundUser.lastattempt = currentUnix;
      if (currentUnixMinus5>=lastAttempt) {
        foundUser.attempts = 0;
      } else if (foundUser.attempts < 3) {
        foundUser.attempts += 1;
      }

      return [401, {'response':'wrong-password'}]
    }
  } else {
    return [401, {"response":"attempts-excedeed"}]
  }
}

const modelLogOut = async (refreshToken) => {
  const users = await usersDB.find()

  const user = users.find(user => user.refreshToken == refreshToken);

  if (user) {

    user.refreshToken = null;

    const logout = await user.save()

    if (logout) return [200, {'response':'log-out'}]

  } else {
    return [200, {'response':'log-out'}]
  }
}

const modelChangePwd = async (credentials) => {
  const users = await usersDB.find()

  const user = users.find(user =>  {
    if ((user.username == credentials.username) || (user.email == credentials.username)) {
      return user
    }
  })

  if (!user) return [401, {'response':'not-found'}]
  const match = await bcrypt.compare(credentials.oldPassword, user.password);
  if (match) {
    console.log('works')
    newPassword = passwordRegex.test(striptags(credentials.newPassword)) ? credentials.newPassword : null;

    if (!newPassword) return [400, {'response': 'invalid-password'}];
    const hash = await bcrypt.hash(newPassword, 10);
    
    user.password = hash;
    user.datestamp = dayjs().add(30, 'day').unix();
    user.attempts = 0;

    const update = user.save();

    if (update) return [200, {'response': 'updated-password'}]

  } else {
    return [401, {'response':'wrong-password'}]
  }
}

module.exports = { modelChangePwd, modelSignUp, modelLogOut, modelSignIn }