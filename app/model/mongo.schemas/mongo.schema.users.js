const mongoose = require('mongoose');
const dayjs = require('dayjs')

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }, 
  password: {
    type: String,
    required: true
  }, 
  refreshToken: {type: String, default: null},
  roles: {
    User: {
      type: Number,
      populate: 2001
    }, 
    Editor: Number,
    Admin: Number
  }, 
  datestamp: {type: Number, default: dayjs().add(30, 'day').unix()
  },
  attempts: {type: Number, default: 0, max: 3, min: 0},
  lastattempt: {type: Number, default: dayjs().unix()},
  validattempt: {type: Number, default: dayjs().unix()}
});

module.exports = mongoose.model('users', userSchema)