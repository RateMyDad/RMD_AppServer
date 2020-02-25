const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,

  profile: {
    parent_profile: mongoose.ObjectId,
    user_profile: mongoose.ObjectId
  }

});

const userModel = mongoose.model('User', UserSchema);
module.exports = userModel;