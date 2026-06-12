const express = require("express");
const Router = express.Router();

Router.route("*")
    .post((req, res) => {
        console.log(req)

    })

module.exports = Router