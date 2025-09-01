const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')
const { client, mongodb, ObjectId } = require('../configuration/mongodb.config');
require('dotenv').config();
//IMPORTANT: put the fileType key in EVERY file's metadata uploaded

//resume
const uploadResume = async (file) => {
  //uploading large files using gridFs
  //https://www.mongodb.com/docs/drivers/node/current/crud/gridfs/#create-a-gridfs-bucket
  await client.connect()
  const db = client.db(process.env.DB_NAME);
  const pingResult = await db.command({ping: 1})
  if (!pingResult) throw new Error('db-not-pinging')
  console.log('works')
  const uploadFilesBucket = new mongodb.GridFSBucket(db, {bucketName: process.env.FILES_BUCKET});
  //using cursors to extract data from buckets
  //https://www.mongodb.com/docs/drivers/node/current/crud/query/cursor/#overview
  const cursor = uploadFilesBucket.find({ filename: 'resume'})
  if (cursor) {
    for await (const doc of cursor) {
      const resumeId = doc._id.toString();
      await uploadFilesBucket.delete(new ObjectId(resumeId))
      await cursor.close()
    }
  }
  const writeStream = await new Promise((resolve, reject) => {
      const uploadStream = uploadFilesBucket.openUploadStream('resume', {
        metadata: {
          fileType: 'resume'
        }
      })
      fs.createReadStream(file.path).
       pipe(uploadStream);

      uploadStream.on('finish', () => {
        resolve()
      })

      process.on('uncaughtException', (err) => {
        client.close()
        if (err) reject()
      })
  }).then(res => true).catch(res => false)
  
  if (fs.existsSync(file.path)) {
    await fsPromises.unlink(file.path)
  }

  if (writeStream) {
    setTimeout(() => {
      client.close()
    }, 1000)
    return [200, {'response': 'resume-uploaded'}]
  }

  else throw new Error('database')
}

const getResumeBlob = async () => {
  await client.connect()
  const db = client.db(process.env.DB_NAME);
    const pingResult = await db.command({ping: 1})
  if (!pingResult) throw new Error('db-not-pinging')
  const bucket = new mongodb.GridFSBucket(db, {bucketName: process.env.FILES_BUCKET})
  if (!bucket) throw new Error('bucket error')
  const cursor = bucket.find({filename: 'resume'})
  let objectId
  for await (const doc of cursor) {
    objectId = doc._id.toString();
    cursor.close() 
  }

  const fileName = Math.round(Math.random() * 1e9);

  const result = await new Promise((resolve, reject) => {

      const downloadStream = bucket.openDownloadStream(new ObjectId(objectId)).
        pipe(fs.createWriteStream(path.join(__dirname, '../', '../', 'public', 'temp', 'resumeStream'+fileName)))

      downloadStream.on('finish', async () => {
        
        const file = await fsPromises.readFile(path.join(__dirname, '../', '../', 'public', 'temp', 'resumeStream'+fileName))
        resolve(file)
      })

      process.on('uncaughtException', (err) => {
        reject(err)
      })
      
    }).then(res => res).catch(err => {
      const error = err
      return false
    })
  await fsPromises.unlink(path.join(__dirname, '../', '../', 'public', 'temp', 'resumeStream'+fileName))
  if (result) return [200, result];
  else throw new Error(error.message)
}

//portfolios images 68a98e4def60ff06883fb202

const uploadPortProject = async ({
  header,
  image,
  description,
  href,
  type,
  linkType
}) => {
  await client.connect();
  const db = client.db(process.env.DB_NAME);
  const pingResult = await db.command({ping: 1})
  if (!pingResult) throw new Error('db-not-pinging')
  const bucket = new mongodb.GridFSBucket(db, {bucketName: process.env.FILES_BUCKET});
    if (!bucket) throw new Error('bucket error')
  const result = await new Promise((resolve, reject) => {
    //set the chunckSizeBytes to avoid buffer chucks queing too much that could lead to node js aborting the whole process due to memory usage excediing, https://nodejs.org/dist/v8.4.0/docs/api/stream.html#stream_writable_write_chunk_encoding_callback
    
    const bucketStream = bucket.openUploadStream(image.originalname, {
      chunkSizeBytes: 1048576,
      metadata: {
        header: header,
        description: description,
        originalName: image.originalname,
        href: href,
        type: type,
        linkType: linkType,
        fileType: 'portImage'
      }
    })

    fs.createReadStream(image.path).
      pipe(bucketStream);

    bucketStream.on('finish', () => {
      client.close()
      resolve()
    })

    process.on('uncaughtException', (err) => reject(err))
  }).then(res => 'ok').catch(err => err)

  if (fs.existsSync(image.path)) {
    await fsPromises.unlink(image.path);
  } 
    

  if (result === 'ok') return [200, {'response': ''}] 
  else throw new Error(result.message);
}

const getPortProjects = async () => {
  await client.connect()
  const db = client.db(process.env.DB_NAME);
    const pingResult = await db.command({ping: 1})
  if (!pingResult) throw new Error('db-not-pinging')
  const bucket = new mongodb.GridFSBucket(db, {
    bucketName: process.env.FILES_BUCKET
  })
  if (!bucket) throw new Error('bucket error')
  const cursor = bucket.find({});
  let projectArray = []
  for await (const doc of cursor) {
      if (doc.metadata.fileType === 'portImage') {
        projectArray.push(doc.metadata)
      }
  }

  const response = await new Promise(async (resolve, reject) => {
    async function waitStream(stream, index) {
      return await new Promise ((resolve) => {
      stream.on("data", (data) => {
        projectArray[index].image64 = data.toString("base64")
        resolve()
      })
      })
    }

    for (i = 0; i < projectArray.length; i++) {
      const stream = bucket.openDownloadStreamByName(projectArray[i].originalName)

      await waitStream(stream, i)

      process.on('uncaughtException', (error) => {
        reject(error)
      })
    }

    resolve()
  }).then(res => 'ok').catch(err => err)

  if (response === 'ok') {
    return [200, projectArray]
  } else throw new Error(response)
}
module.exports = {uploadResume, getResumeBlob, uploadPortProject, getPortProjects}