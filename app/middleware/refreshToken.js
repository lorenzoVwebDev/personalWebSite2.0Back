
const jwt = require('jsonwebtoken');
const {mysqlQuery} = require('../configuration/mysqldb.config.js')

require('dotenv').config();

const refreshToken = async (req, res, next) => {
  const cookies = req.cookies

  if (!cookies.refreshToken) return res.status(401).json({"message":"unauthorized"})

  const refreshToken = cookies.refreshToken;

  const users = await new Promise((resolve, reject) => {
    mysqlQuery('select * from ??', ['users'], resolve, reject);
  }).then(data => data).catch(error => {
    throw new Error(error)
  }) 

  const foundUser = users.find(user => {
    return user.refresh_token === refreshToken
  })

  if (!foundUser) return res.status(403).json({"message": "not-found"})

    const rolesArray = await new Promise((resolve, reject) => {
      mysqlQuery('select role_code, id from roles left join users on roles.user_id = users.id where user_id = ?;', [foundUser.id], resolve, reject);
    }).then(data => data).catch(error => {
      throw new Error(error)
    })

    for (let I=0;I<rolesArray.length;I++) {
      if (rolesArray[I].role_code) {
        const i = (I+1).toString();
        foundUser.roles = {
          ...foundUser.roles, 
          [i]: rolesArray[I].role_code
        };
      } 
    }

    const roles = Object.values(foundUser.roles);

  jwt.verify(
    refreshToken, 
    process.env.REFRESH_TOKEN, 
    (err, decoded) => {
      if (err || foundUser.username !== decoded.username) return res.status(403).json({"message": err.message})
        const accessToken = jwt.sign(
          {
            "userInfo": {
              'username': foundUser.username,
              'roles': roles
          }},
          process.env.ACCESS_TOKEN,
          {expiresIn: 900}
        );

        return res.status(200).json({'accessToken': accessToken})

    })
}

module.exports = refreshToken
