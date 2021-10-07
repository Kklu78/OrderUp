const mongoose = require('mongoose');
const Schema = mongoose.Schema;




// Create your User Model
const orderSchema = new mongoose.Schema({
    restaurantId: String,
    datetime: Date,
    userOrders: [{type: mongoose.Schema.Types.ObjectId, ref: 'userOrder'}],
    closed: {type: Schema.Types.Boolean, default: false}
    }, {
    timestamps: true
  });

  module.exports = mongoose.model('Order', orderSchema);