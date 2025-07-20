const express = require('express');
require('dotenv').config()
const Router = express.Router()
const verifyJWT = require('../../middleware/verifyJWT.js')
const verifyRoles = require('../../middleware/verifyRoles.js')
const { getAllEmployees, createNewEmployee, updateEmployee, deleteEmployee, getEmployee } = require('../../controller/employees.controller.js')

Router.route('/*')
  .get(verifyJWT, verifyRoles(process.env.USER_ID), (req, res, next) => { 
    if (req.query.id === 'ALL') {
      getAllEmployees(req, res, next)
    } else {
      getEmployee(req, res, next)
    }
  })
  .post(verifyJWT, verifyRoles(process.env.ADMIN_ID, process.env.EDITOR_ID), createNewEmployee)
  .put(verifyJWT, verifyRoles(process.env.ADMIN_ID, process.env.EDITOR_ID), updateEmployee)
  .delete(verifyJWT, verifyRoles(process.env.ADMIN_ID, process.env.EDITOR_ID), deleteEmployee)

module.exports = Router