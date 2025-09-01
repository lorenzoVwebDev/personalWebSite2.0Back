const express = require('express')
const Router = express.Router()
const upload = require('../../middleware/multer.js')
const {uploadCv, getResume, uploadProject, getAllProjects} = require('../../controller/fileupload.controller.js')

Router.route('/resume').
  put(upload.single('resume'), uploadCv). 
  get(getResume)

Router.route('/project').
  post(upload.single('projectImage'), uploadProject).
  get(getAllProjects)

  module.exports = Router