const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        validate: {
          validator: function (v) {
            return Number.isInteger(v);
          },
          message: (prop) => `Quantity should be an integer value`,
        },
      },
      razorPayId: {
        type: String,
        required: true,
      },
      transactionStatus: {
        type: String,
        enum: ["success", "failure"],
      },
      totalSum: {
        type: Number,
        required: true,
      },
    },
  ],
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
