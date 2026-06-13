const express = require("express");
const Router = express.Router();
const {uploadContacts} = require("../../controller/contacts.controller")

Router.route("*")
    .post(uploadContacts)

module.exports = Router