const mongoose = require('mongoose');

const DadProfileSchema = new mongoose.Schema({
  username: String,

  name: {
    first: String,
    last: String
  },

  skills: {
    grilling: Number,
    cooking: Number,
    bags: Number,
    golf: Number,
    softball: Number,
    coaching: Number,
    generosity: Number,
    looks: Number,
    dad_factor: Number,
    fantasy_football: Number,
    humor: Number,
    emotional_stability: Number,
    handiness: Number,
    kids: Number,
    stealth_food_preparation: Number,
    tech: Number,
    furniture_assembly: Number,
    photography: Number
  },

  zip: Number,

  location: {
    country: String,
    region: String
  },

  meta: {
    rating: Number,
    skillScore: Number
  }

});
const DadProfile = mongoose.model('DadProfile', DadProfileSchema);
module.exports = DadProfile;
