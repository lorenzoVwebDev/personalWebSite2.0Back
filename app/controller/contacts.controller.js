const path = require('path');
const fs = require('fs')
const fsPromises = require('fs').promises
const striptags = require('striptags')
const model = require('../model/uploadcontacts.model')

const uploadContacts = async (req, res, next) => {
    const {first_name, last_name, email, comment} = req.body

    if (!first_name || !last_name || !email) return res.status(401).json({"response": "missing-credentials"})
        
        const contactsObj = {
          first_name: striptags(first_name),
          last_name: striptags(last_name),
          email: striptags(email)
        }
        
        if (comment) contactsObj.comment = striptags(comment);

    try {
        const result = await model.modelUploadContacts(contactsObj)

        return res.status(result[0]).json(result[1])
    } catch (err) {
        next(err)
    }
}

module.exports = { uploadContacts }