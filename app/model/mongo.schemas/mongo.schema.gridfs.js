const multer = require("multer");
const {
  GridFsStorage
} = require("multer-gridfs-storage");
require('dotenv').config()

function upload() {
  const url = process.env.MONGO_DB_URI;
  const storage = new GridFsStorage({
    url,
    file: (req, filename) => {
      return {
        filename: '_englishResume',
        bucketName: 'resumeBucket'
      }
    }
  })
}



