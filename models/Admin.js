const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
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
    salt: String,
    hash: String,
    role: {
      type: String,
      default: "vendor",
    },
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedVendors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
      },
    ],
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
