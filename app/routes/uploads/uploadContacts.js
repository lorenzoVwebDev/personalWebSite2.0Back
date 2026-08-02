const express = require("express");
const Router = express.Router();
const upload = require('../../middleware/multer.js')
const {uploadPlainContacts, uploadContactsProduction, uploadContactsMix, uploadContactsMastering} = require("../../controller/contacts.controller")

Router.route("/plain")
    .post(uploadPlainContacts)

Router.route("/production")
    .post(uploadContactsProduction)

Router.route("/mix")
    .post(uploadContactsMix)

Router.route("/master")
    .post(uploadContactsMastering)

module.exports = Router