const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  items: 
    {
      type:Schema.Types.ObjectId,
      ref:'Item'
    }
},{timestamps:true});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

