const mongoose = require('mongoose');

const DadProfileSchema = new mongoose.Schema({

  name: {
    first: String,
    last: String
  },

  skills: {
    grill: Number,
    bags: Number
  }

});

const DadProfile = mongoose.model('DadProfile', DadProfileSchema);
module.exports = DadProfile;
