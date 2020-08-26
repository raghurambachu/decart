const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    isListed: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    markup: {
      type: String,
      required: true,
    },
    listPrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    isFavorited: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    quantity: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: (prop) =>
          `${prop.value} is not an integer. Quantity needs to be an Integer`,
      },
    },
    images: [
      {
        type: String,
      },
    ],
    ratings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
    },
    warranty: {
      type: Number,
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: (prop) => `Specify the warranty in months`,
      },
    },
    easyPayAvailable: {
      type: Boolean,
      default: true,
    },
    policy: {
      type: String,
      default: "return",
      enum: ["return", "replace", "none"],
    },
    stock: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: (prop) => `Specify the warranty in months`,
      },
    },
  },
  {
    timestamps: true,
  }
);

productSchema.path("listPrice").set(function (price) {
  return price * 100;
});

productSchema.path("listPrice").get(function (price) {
  return (price / 100).toFixed(2);
});

productSchema.path("sellingPrice").set(function (price) {
  return price * 100;
});

productSchema.path("sellingPrice").get(function (price) {
  return (price / 100).toFixed(2);
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
