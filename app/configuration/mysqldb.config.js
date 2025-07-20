const mysql = require('mysql');
const { errorCreator } = require('./commonFunctions.js');

require('dotenv').config();

const mysqlQuery = (query, placeHolders, resolve, reject) => {
  let result = undefined;

  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'mvc_user_roles'
  })

  connection.connect((err) => {
    if (err) {
      reject(err);
      connection.destroy()
    }
  })
  
  connection.query(query, placeHolders, (error, results, fields) => {
    if (error) {
      reject(error)
      connection.destroy()
    } else {
      resolve(results)
      connection.end()
    };
  })
}

module.exports = { mysqlQuery }
