const path = require('path');
const fs = require('fs')
const fsPromises = require('fs').promises
const striptags = require('striptags')
const model = require('../model/uploadcontacts.model')
const nodemailer = require('nodemailer'); 
const {MailtrapClient } = require('mailtrap')
const {sendContactsMail} = require("../configuration/mail.config")

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

        if (result[0] === 200) await sendContactsMail(req.body.request_type, first_name, last_name, email)
        return res.status(result[0]).json(result[1])
    } catch (err) {
        next(err)
    }
}

const uploadContactsProduction = async (req, res, next) => {
    const youtubeRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})([?&].*)?$/;
    const file = req.file;

    const {request_type, first_name, last_name, email, comment, 
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

        if (result[0] === 200) await sendContactsMail(request_type, first_name, last_name, email)
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
        if (result[0] === 200) await sendContactsMail(body.request_type, body.first_name, body.last_name, body.email)
        return res.status(result[0]).json(result[1])
    } catch (err) {
        next(err)
    }
}

const uploadContactsMastering = async (req, res, next) => {
    const body = req.body;

    if (!body.first_name || !body.last_name || !body.email || !body.wetransfer_link
) return res.status(400).json({"response": "missing-credentials"})
    
    const contactMasterObject = {};
    contactMasterObject.optionObject = {}

    Object.entries(body).forEach((value, index) => {
        if (value[0].startsWith("option-")) {
            contactMasterObject.optionObject[value[0]] = value[1]
        } else contactMasterObject[value[0]] = value[1]
    })

    try {
        const result = await model.modelUploadContactsMaster(contactMasterObject)
        
        if (result[0] === 200) await sendContactsMail(body.request_type, body.first_name, body.last_name, body.email)
        return res.status(result[0]).json(result[1]);
    } catch (err) {
        next(err)
    }
}

module.exports = { uploadPlainContacts, uploadContactsProduction, uploadContactsMix,  uploadContactsMastering}