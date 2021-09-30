const mongoose = require('mongoose');

const userorderSchema = new mongoose.Schema({
    userId: String,
    order: []

  }, {
    timestamps: true
  });

// Create your User Model
const orderSchema = new mongoose.Schema({
    restaurantId: String,
    datetime: Date,
    userOrders: [userorderSchema],
  
  }, {
    timestamps: true
  });



  module.exports = mongoose.model('Orders', userSchema);