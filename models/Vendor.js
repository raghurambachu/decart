const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vendorSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: [true, "Username should be unique."],
    },
    displayName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email should be unique."],
    },
    mobile: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v);
        },
        message: (props) => `${props.value} is not a valid mobile number.`,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdminVerified: {
      type: Boolean,
      default: false,
    },
    salt: String,
    hash: String,
    role: {
      type: String,
      default: "vendor",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    product: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;
