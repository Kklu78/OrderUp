const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userorderSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    order: {type: Schema.Types.Mixed, default: {}},
    orderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Orders'},
    closed: {type: Schema.Types.Boolean, default: false}
  }, {
    timestamps: true
  });

  module.exports = mongoose.model('userOrder', userorderSchema);