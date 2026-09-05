const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')
const { client, mongodb, ObjectId } = require('../configuration/mongodb.config');
require('dotenv').config();

const modelUploadContacts = async (contactsObj) => {

    await client.connect();
    const db = client.db(process.env.DB_NAME);

    const pingResult = await db.command({ping: 1});

    if (!pingResult) return new Error("db-not-pinging");

    const contactsCollection = db.collection("contacts-collection")
    if (!contactsCollection) await db.createCollection("contacts-collection")

    const result = await contactsCollection.insertOne(contactsObj)

    await client.close()

    if (!result.insertedId.toString) return new Error("db-not-inserting")

    return [200, {"response": "contacts-inserted"}]
}

const modelUploadContactsProduction = async (contactsProdObj) => {

    await client.connect();

    const db = client.db(process.env.DB_NAME);

    const pingResult = await db.command({ping: 1});

    if (!pingResult) return new Error("db-not-pinging");
    const contactsCollection = db.collection("contacts-collection")
    if (!contactsCollection) await db.createCollection("contacts-collection")

        const contactInfo = {}
        Object.entries(contactsProdObj).forEach((contact) => {
            if (contact[0] === "audio_file") {
            
            } else {
                contactInfo[contact[0]] = contact[1]
            }
        })

    const result = await contactsCollection.insertOne(contactInfo)
    //test fake email
    //const fakeUserEmail = "fake.email@emailfake.it"
    
    switch (contactsProdObj.audio_file ? true : false) {
        case (true): {

            const uploadFilesBucket = new mongodb.GridFSBucket(db, {bucketName: process.env.FILES_BUCKET});

            const writeStream = await new Promise((resolve, reject) => {
                const uploadStream = uploadFilesBucket.openUploadStream(`${contactInfo.email}_audio_file`, {
                    metadata: {
                        fileType: "audio_file"
                    }
                })

                fs.createReadStream(contactsProdObj.audio_file.path).
                pipe(uploadStream);

                uploadStream.on("finish", () => {
                    resolve()
                })

                process.on("uncaughtException", (err) => {
                    client.close()
                    if (err) reject(err)
                })
            }).then(res => true).catch(res => res)

              if (fs.existsSync(contactsProdObj.audio_file.path)) {
                await fsPromises.unlink(contactsProdObj.audio_file.path)
              }

            if (writeStream instanceof Error) {

                throw writeStream
            }

            setTimeout(() => {
                client.close()
            }, 1000)
            return [200, {"response": "audio-file-uploaded"}]

            break;
        }

        default: {
            await client.close()

            if (!result.insertedId.toString) return new Error("db-not-inserting")

            return [200, {"response": "contacts-inserted"}]
        }
    }
}

const modelUploadContactsMix = async (contactsMixObj) => {
    await client.connect();
    const db = client.db(process.env.DB_NAME);

    const pingResult = await db.command({ping: 1});

    if (!pingResult) return new Error("db-not-pinging");

    const contactsCollection = db.collection("contacts-collection")
    if (!contactsCollection) await db.createCollection("contacts-collection")

    const result = await contactsCollection.insertOne(contactsMixObj)

    await client.close()

    if (!result.insertedId.toString) return new Error("db-not-inserting")

    return [200, {"response": "contacts-inserted"}]
}

const modelUploadContactsMaster = async (contactMasterObject) => {
    await client.connect();

    const db = client.db(process.env.DB_NAME);

    const pingResult = await db.command({ping: 1});

    if (!pingResult) return new Error("db-not-pinging");

    const contactsCollection = db.collection("contacts-collection")
    if (!contactsCollection) await db.createCollection("contacts-collection")

    const result = await contactsCollection.insertOne(contactMasterObject)

    await client.close()

    if (!result.insertedId.toString) return new Error("db-not-inserting")

    return [200, {"response": "contacts-inserted"}]
}

module.exports = { modelUploadContacts, modelUploadContactsProduction, modelUploadContactsMix, modelUploadContacts, modelUploadContactsMaster }