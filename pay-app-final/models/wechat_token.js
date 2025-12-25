const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accessTokenSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('wechat_access_token', accessTokenSchema);