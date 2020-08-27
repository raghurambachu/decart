const mongoose = require("mongoose");
const randomize = require("randomatic");
const {
  sendCodeOnVendorRegister,
  sendSuccessfulVendorRegistration,
  sendAdminVerificationPending,
  transporter,
} = require("../services/nodemailer");
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
    code: {
      type: String,
      validate: {
        validator: function (v) {
          return v.length === 6;
        },
        message: () => `code should be of 6 digits`,
      },
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

vendorSchema.pre("save", async function (next) {
  // Create Cart and set
  if (!this.isVerified) {
    //   Generate Code
    this.code = randomize("Aa0", 6);
  }
  next();
});

vendorSchema.post("save", async function (vendor, next) {
  // Need to Send Email
  let mailOptions;
  if (!vendor.isVerified) {
    mailOptions = sendCodeOnVendorRegister(vendor);
  } else if (vendor.isVerified && vendor.isAdminVerified) {
    mailOptions = sendSuccessfulVendorRegistration(vendor);
  } else if (vendor.isVerified) {
    mailOptions = sendAdminVerificationPending(vendor);
  }
  try {
    const sendMail = await transporter.sendMail(mailOptions);
    next();
  } catch (err) {
    next(err);
  }
});

const Vendor = mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;
