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

module.exports = { modelUploadContacts }