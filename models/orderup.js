const mongoose = require('mongoose');



// Create your User Model
const orderSchema = new mongoose.Schema({
    restaurantId: String,
    datetime: Date,
    userOrders: [{type: mongoose.Schema.Types.ObjectId, ref: 'userOrder'}],
    open: Boolean
    }, {
    timestamps: true
  });

  module.exports = mongoose.model('Order', orderSchema);