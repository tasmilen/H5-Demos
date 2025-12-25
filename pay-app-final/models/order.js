const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  order_no: {
    type: String,
    required: true,
  },
  fee: {
    type: Number,
    default: 0,
  },
  address: {
    type: String,
    default: '',
  },
  paid: {
    type: Boolean,
    default: false
  },
  paid_time: {
    type: Date
  }
}, {
  timestamps: true,
})

module.exports = mongoose.model('Order', OrderSchema);
