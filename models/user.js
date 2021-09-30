const mongoose = require('mongoose');

const factSchema = new mongoose.Schema({
    text: String
  }, {
    timestamps: true
  });

// Create your User Model
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    cohort: String,
    avatar: String,
    facts: [factSchema],
    googleId: String
  
  }, {
    timestamps: true
  });



  module.exports = mongoose.model('User', userSchema);