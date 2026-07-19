const express = require("express");
const Router = express.Router();
const upload = require('../../middleware/multer.js')
const {uploadPlainContacts, uploadContactsProduction, uploadContactsMix} = require("../../controller/contacts.controller")

Router.route("/plain")
    .post(uploadPlainContacts)

Router.route("/production")
    .post(uploadContactsProduction)

Router.route("/mix")
    .post(uploadContactsMix)

module.exports = Router