const express = require("express");
const Router = express.Router();
const upload = require('../../middleware/multer.js')
const {uploadPlainContacts, uploadContactsProduction} = require("../../controller/contacts.controller")

Router.route("/plain")
    .post(uploadPlainContacts)

Router.route("/production")
    .post(uploadContactsProduction)

module.exports = Router