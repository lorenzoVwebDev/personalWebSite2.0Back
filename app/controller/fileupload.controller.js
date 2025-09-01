const path = require('path');
const fs = require('fs')
const fsPromises = require('fs').promises
const model = require('../model/uploadfiles.model')
const { errorCreator } = require('../configuration/commonFunctions')

//resume
const uploadCv = async (req, res, next) => {
  const file = req.file

  if (!file) {
    if (fs.existsSync(req.file.path)) {
      await fsPromises.unlink(req.file.path)
    }
    return res.status(400).json({"response": "no-content"});
  }

  try {
    const result = await model.uploadResume(file)
    
    return res.status(result[0]).json(result[1])
  } catch (error) {
    res.status(500).json({'response': 'server-error'});
    next(errorCreator(error.message, 'error', __filename))
  }
}

const getResume = async (req, res, next) => {
  try {
    console.log('hello')
    const result = await model.getResumeBlob()

    return res.status(result[0]).send(result[1])
  } catch (error) {
    res.status(500).json({'response': 'server-error'});
    next(errorCreator(error.message, 'error', __filename))
  }

}

//portfolios images
const uploadProject = async (req, res, next) => {

  const {projectHeader, projectDescription, projectHref, projectType, projectLinkType} = req.body

  if(!projectHeader || !projectDescription || !projectHref || !projectType || !projectLinkType) return res.status(400).json({'response': 'missing-metadata'})

  if (!req.file) return res.status(400).json({'response': 'missing-image'})
  
  const file = req.file
  

/*   if (!file) {
    if (fs.existsSync(req.file.path)) await fsPromises.unlinkSync(req.file.path);
    return res.status(400).json({"response":"missing-file"});
  }  */

  const projectOjbect = {
    header: projectHeader,
    image: file,
    description: projectDescription,
    href: projectHref,
    type: projectType,
    linkType: projectLinkType,
  }

  try {
    const response = await model.uploadPortProject(projectOjbect)

    return res.status(response[0]).json(response[1])
  } catch (error) {
    res.status(500).json({'response':'server-error'})
    next(errorCreator(error.message, 'error', __filename))
  }
}

const getAllProjects = async (req, res, next) => {
  try {
    const result = await model.getPortProjects();

    return res.status(result[0]).json(result[1])
  } catch (error) {
    res.status(500).json({"response": "server-error"})
    next(errorCreator(error.message, 'error', __filename))
  }
}

module.exports = { uploadCv, getResume, uploadProject, getAllProjects}