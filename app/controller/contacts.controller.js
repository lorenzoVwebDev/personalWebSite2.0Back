const path = require('path');
const fs = require('fs')
const fsPromises = require('fs').promises
const striptags = require('striptags')
const model = require('../model/uploadcontacts.model')

const uploadPlainContacts = async (req, res, next) => {
    const {first_name, last_name, email, comment} = req.body

    if (!first_name || !last_name || !email) return res.status(401).json({"response": "missing-credentials"})
        
        const contactsObj = {
          type: "plain",  
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

const uploadContactsProduction = async (req, res, next) => {
    const youtubeRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})([?&].*)?$/;
    const file = req.file;

    const {first_name, last_name, email, comment, 
        genre, tracks_number, phone_number, reference1, 
        reference2, reference3, wapp_contact
    } = req.body

    if (!first_name || !last_name || !email || !genre || 
        !tracks_number) return res.status(401).json({"response": "missing-credentials"});

        const contactsProdObj = {
          type: "production",
          first_name: striptags(first_name),
          last_name: striptags(last_name),
          email: striptags(email),
          genre: striptags(genre),
          tracks_number: parseInt(striptags(tracks_number))
        }

        if (file) contactsProdObj.audio_file = file;
        if (phone_number != "undefined") contactsProdObj.phone_number = phone_number;
        if (wapp_contact != "false") contactsProdObj.wapp_contact = true
        !reference1 ? null : reference1.match(youtubeRegex) ? contactsProdObj.reference1 = reference1 : null;
        !reference2 ? null : reference2.match(youtubeRegex) ? contactsProdObj.reference2 = reference1 : null;
        !reference3 ? null : reference3.match(youtubeRegex) ? contactsProdObj.reference3 = reference1 : null;
        
    try {
    
        const result = await model.modelUploadContactsProduction(contactsProdObj)

        return res.status(result[0]).json(result[1])
    } catch (err) {
        next(err)
    }
}

const uploadContactsMix = async (req, res, next) => {
    const body = req.body
    if (!body.first_name || !body.last_name || !body.email) return res.status(400).json({"response": "missing-credentials"})
    let contactsMixObject = {};
    contactsMixObject.optionObject = {}
    Object.entries(body).forEach((value, index) => {
        if (value[0].startsWith("option-")) {
            contactsMixObject.optionObject[value[0]] = value[1]
        } else contactsMixObject[value[0]] = value[1]
    })
    
    try {
        const result = await model.modelUploadContactsMix(contactsMixObject)
        return res.status(result[0]).json(result[1])
    } catch (err) {
        next(err)
    }
    return res.send("works")
}

module.exports = { uploadPlainContacts, uploadContactsProduction, uploadContactsMix }