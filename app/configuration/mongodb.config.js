const { MongoClient } = require("mongodb");

//test
require('dotenv').config();
const client = new MongoClient(process.env.MONGO_DB_URI)

async function run() {
  try {
    const database = client.db("mongo-mvc-db");
    const users = database.collection("users");
    console.log(users)
    const query = {
      username: "lorenzo1"
    }

    const username = await users.findOne(query)
    console.log(username)
  } finally {
    console.log("right query")
  }
}

module.exports = run
/* require('dotenv').config()
const mongoose = require('mongoose');
const multer = require("multer");
const {
  GridFsStorage
} = require("multer-gridfs-storage");

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_DB_URI);

  mongoose.connection.on('open', () => {
    var db = mongoose.connections[0].db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "resumeBucket"
    })
  })
}

module.exports = main */