const mongodb  = require("mongodb");
const { MongoClient, ServerApiVersion, ObjectId } = mongodb
//test
require('dotenv').config();
const client = new MongoClient(process.env.MONGO_DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
  compressors: ["zlib"]
})


module.exports = { client, mongodb, ObjectId}
