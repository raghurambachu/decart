const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Cart = require("./Cart");
const randomize = require("randomatic");
const {
  transporter,
  sendCodeOnUserRegister,
} = require("../services/nodemailer");

const userSchema = new Schema(
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
    provider: [
      {
        type: String,
        enum: ["local", "google"],
      },
    ],
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
    address: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    code: {
      type: String,
      validate: {
        validator: function (v) {
          return v.length === 6;
        },
        message: () => `code should be of 6 digits`,
      },
    },
    salt: String,
    hash: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
    favorited: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    isPlus: {
      type: Boolean,
      default: false,
    },
    recentlyViewed: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    couponsAvailed: [
      {
        type: Schema.Types.ObjectId,
        ref: "Coupon",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Create Cart and set
  const userId = this._id;
  let cart = {};
  cart.userId = userId;

  //   Generate Code
  this.code = randomize("Aa0", 6);
  try {
    // Create Cart
    cart = await Cart.create(cart);
    this.cart = cart._id;
  } catch (err) {
    next(err);
  }
  next();
});

userSchema.post("save", async function (user, next) {
  // Need to Send Email
  const mailOptions = sendCodeOnUserRegister(user);
  try {
    const sendMail = await transporter.sendMail(mailOptions);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
