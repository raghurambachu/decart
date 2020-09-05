var express = require("express");
const passport = require("passport");
const crypto = require("crypto");

var router = express.Router();
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Admin = require("../models/Admin");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Item = require("../models/Item");
const Order = require("../models/Order");
const Review = require("../models/Review")
const instance = require("../services/razorpay");

const auth = require("../middlewares/auth");
const {
  userRegisterValidationRules,
  validateRegisterForm,
  verifyUserIdRules,
  validateVerifyUserIdRules,
  verifyUserFormRules,
  validateVerifyUserFormRules,
} = require("../utils/validator");
const { selectFields } = require("express-validator/src/select-fields");
const { findByIdAndUpdate, findOne } = require("../models/Product");

router.get("/register", function (req, res, next) {
  let errors;
  errors = req.flash("errors") || null;
  res.render("user/register", {
    title: "Register",
    username: "",
    email: "",
    password: "",
    errors: errors,
  });
});

router.post(
  "/register",
  userRegisterValidationRules(),
  validateRegisterForm,
  async function (req, res, next) {
    const user = req.body;
    const { username, email, password } = user;
    // search if user is already registered.
    try {
      const admin = await Admin.findOne({ email });
      const vendor = await Vendor.findOne({ email });
      if (admin || vendor) {
        req.flash(
          "errors",
          `${email} is already registered. Try with different email id.`
        );
        return res.redirect("/users/register");
      }
      const user = await User.findOne({ email });
      if (user) {
        const provider = user.provider;
        if (provider.includes("local")) {
          req.flash("message", `${email} already registered, try logging in.`);
          return res.redirect("/users/login");
        } else {
          req.flash(
            "message",
            `${email} registered using Google Auth, try loggin in using Google Auth.`
          );
          return res.redirect("/users/login");
        }
      } else {
        const { salt, hash } = await auth.generateSaltAndHash(password);
        let newUser = {
          username,
          email,
          salt,
          hash,
          displayName: username[0].toUpperCase() + username.slice(1),
          provider: ["local"],
          isVerified: false,
          role: "user",
          isBlocked: false,
          isPlus: false,
        };
        let user = new User(newUser);
        user = await user.save();
        req.flash(
          "message",
          "Please verify your email, by clicking on the link sent to your registered email."
        );
        return res.redirect("/users/login");
      }
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/users/login" }),
  function (req, res) {
    res.redirect(req.session.returnTo || "/");
    delete req.session.returnTo;
  }
);

router.get("/login", function (req, res, next) {
  let errors, msg;
  errors = req.flash("errors") || null;
  msg = req.flash("message") || null;
  res.render("user/login", {
    title: "Login",
    email: "",
    password: "",
    errors: errors,
    msg: msg,
  });
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/users/login" }),
  function (req, res) {
    res.redirect(req.session.returnTo || "/");
    delete req.session.returnTo;
  }
);

// router.post("/login", function (req, res, next) {
//   passport.authenticate("local", function (err, user, info) {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       req.flash("message", info.message);
//       return res.redirect("/users/login");
//     } else {
//       return res.redirect("/");
//     }
//   })(req, res, next);
// });

router.get(
  "/verify/:userId",
  verifyUserIdRules(),
  validateVerifyUserIdRules,
  function (req, res, next) {
    const userId = req.params.userId;
    let errors = req.flash("errors") || null;
    res.render("user/verify", { userId, title: "Verify Email", errors });
  }
);

router.post(
  "/verify/:userId",
  verifyUserFormRules(),
  validateVerifyUserFormRules,
  async function (req, res, next) {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      req.flash(
        "message",
        "The verification link is invalid, please click on the link that was sent to your Email"
      );
      return res.redirect("/users/login");
    }
    if (user.code !== req.body.code) {
      req.flash(
        "message",
        "The code entered is invalid, please type the code that was sent to your registered Email"
      );
      return res.redirect("/users/login");
    }
    // If code and mobile is valid then need to store into db
    //Also code needs to be deleted and isVerified:true,
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, {
        isVerified: true,
      });
    } catch (err) {
      next(err);
    }
    req.flash(
      "message",
      "Successfully verified your email. Now you can log in to Decart & enjoy shopping."
    );
    return res.redirect("/users/login");
  }
);

router.get("/cart/me", auth.verifyIfUser, async function (req, res, next) {
  try {
    const cart = await Cart.findOne({ _id: req.user.cart })
      .populate({
        path: "items.productId",
        populate: {
          path: "createdBy",
          select: "_id name displayName",
        },
      })
      .exec();

    res.render("user/cart", { title: "My Cart", cart });
  } catch (err) {
    next(err);
  }
});

router.get("/cart/me/delete/:productId",auth.verifyIfUser,async function(req,res,next){
  const productId = req.params.productId;
  try{
    const product = await Product.findById(productId);
    if(!product){
      res.redirect("/users/cart/me")
    }
    const cartId = req.user.cart;
    const updateCart = await Cart.findByIdAndUpdate(cartId,{$pull:{items : {productId}}},{new:true});
    return res.redirect("/users/cart/me")
  } catch(err){
    next(err);
  }
})

router.get("/cart/me/add/qty/:productId",auth.verifyIfUser,async function(req,res,next){
  const productId = req.params.productId;
  try{
    const product = await Product.findById(productId);
    if(!product){
      return res.redirect("/users/cart/me")
    }
    const cart = await Cart.findById(req.user.cart);
    let item = cart.items.find(item => item.productId.toString() === productId);
    item = {...item._doc,quantity:++item.quantity}
    await cart.save()
    return res.redirect("/users/cart/me")

  } catch(err){
    next(err);
  }
})

router.get("/cart/me/remove/qty/:productId",auth.verifyIfUser,async function(req,res,next){
  const productId = req.params.productId;
  try{
    const product = await Product.findById(productId);
    if(!product){
      return res.redirect("/users/cart/me")
    }
    const cart = await Cart.findById(req.user.cart);
    let item = cart.items.find(item => item.productId.toString() === productId);
    if(item.quantity === 1) {
      cart.items = cart.items.filter(cartItem => cartItem !== item);
      await cart.save();
      return res.redirect("/users/cart/me")
    }
    item = {...item._doc,quantity:--item.quantity}
    await cart.save()
    return res.redirect("/users/cart/me")

  } catch(err){
    next(err);
  }
})

router.get("/cart/:productId", auth.verifyIfUser, async function (
  req,
  res,
  next
) {
  try {
    const productId = req.params.productId;
    // check if productId exists in cart
    const cart = await Cart.findOne({ userId: req.user._id });
    const product = await Product.findOne({ _id: productId });
    if (product) {
      if (cart.items.some((item) => item.productId.toString() === productId)) {
        let item = cart.items.find(
          (item) => item.productId.toString() === productId
        );
        item = { ...item, quantity: ++item.quantity };
        await cart.save();
        return res.redirect(`/product/${product.slug}`);
      }
      let createItem = {
        productId,
        quantity: 1,
      };
      const updatedCart = await Cart.findByIdAndUpdate(cart._id, {
        $push: { items: createItem },
      });
      return res.redirect(`/product/${product.slug}`);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/cart/me/order", auth.verifyIfUser, async function (
  req,
  res,
  next
) {
  const orderDetails = req.body;
  const order = {
    amount: orderDetails.total * 100,
    currency: "INR",
    receipt: "su001",
    payment_capture: "1",
  };
  try {
    const orderData = await instance.orders.create(order);
    const cart = await Cart.findOne({ _id: req.body.cart })
      .populate({
        path: "items.productId",
        populate: {
          path: "createdBy",
          select: "_id name",
        },
      })
      .exec();

    res.render("user/checkout", {
      cart: cart,
      total: orderDetails.total,
      title: "Checkout",
      orderData,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/payment/verify", auth.verifyIfUser, async function (
  req,
  res,
  next
) {
  try {
    const body =
      req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    let response = { status: "failure" };
    if (expectedSignature === req.body.razorpay_signature) {
      console.log("Entered");
      const cart = await Cart.findOne({ _id: req.user.cart })
        .populate("items.productId")
        .exec();
      const products = cart.items.map((item) => item.productId._id);
      const totalSellingPrice = cart.items.reduce(
        (sum, item) => (sum += item.productId.sellingPrice * item.quantity),
        0
      );
      const totalListPrice = cart.items.reduce(
        (sum, item) => (sum += item.productId.listPrice * item.quantity),
        0
      );
      const quantity = cart.items.map((item) => item.quantity);

      const item = await Item.create({
        products,
        totalSellingPrice,
        totalListPrice,
        quantity,
        razorPayOrderId: req.body.razorpay_order_id,
        razorPayPaymentId: req.body.razorpay_payment_id,
      });
      const removeFromCart = await Cart.findByIdAndUpdate(
        req.user.cart,
        { items: [] },
        { new: true }
      );
      const order = await Order.create({ userId: req.user._id, items: item });
      response = { status: "success" };
    }
    res.send(response);
  } catch (err) {
    next(err);
  }
});

router.get("/orders/me", auth.verifyIfUser, async function (req, res, next) {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate({
        path: "items",
        populate: {
          path: "products",
          select: "_id name images sellingPrice slug",
        },
      })
      .exec();

    res.render("user/orders.ejs",{title:"Orders",orders});
  } catch (err) {
    next(err);
  }
});

router.get("/product/:productId/like",auth.verifyIfUser,async function(req,res,next){
  try{
    const productId = req.params.productId;
    // update the productId in the current user.
    const product = await Product.findById(productId);
    if(!product){
      return res.redirect("/")
    } else {
      const user = await User.findByIdAndUpdate(req.user._id,{$addToSet:{favorited:productId}})
      return res.redirect(`/product/${product.slug}`)
    }
  } catch(err){
    next(err);
  }
})

router.get("/product/:productId/unlike",auth.verifyIfUser,async function(req,res,next){
  try{
    const productId = req.params.productId;
    // update the productId in the current user.
    const product = await Product.findById(productId);
    if(!product){
      return res.redirect("/")
    } else {
      const user = await User.findByIdAndUpdate(req.user._id,{$pull:{favorited:productId}})
      return res.redirect(`/product/${product.slug}`)
    }
  } catch(err){
    next(err);
  }
})

router.get("/favorites/me",auth.verifyIfUser, async function(req,res,next){
  try{
    const userId = req.user._id;
    const user = await User.findOne({_id:userId}).populate("favorited","name slug sellingPrice listPrice images").exec();
    res.render("user/favorites",{title:"Favorites",products:user && user.favorited})
  } catch(err){
    next(err);
  }
})

router.post("/product/:productId/review/:slug",auth.verifyIfUser,async function(req,res,next){
  try{
    const productId = req.params.productId;
    const slug = req.params.slug;
    const review = req.body.review;
    const userId = req.user._id;
    const product = await Product.findById(productId);
    if(!product || product.slug !== slug){
      req.flash("message","There exists no such product")
      return res.redirect(`/product/${slug}`);
    }
    const createReview = await Review.create({productId,userId,review});
    req.flash("message","Review Added successfully.")
    return res.redirect(`/product/${slug}`)
  } catch(err){
    next(err)
  }
})

router.get("/product/:slug/review/:reviewId/delete",auth.verifyIfUser,async function(req,res,next){
  try{
    const slug = req.params.slug;
    const reviewId = req.params.reviewId;
    const product = await Product.findOne({slug});
    if(!product) {
      req.flash("message","There is no such product");
      return res.redirect(`/product/${slug}`);
    }
    const productId = product._id;
    const removeReview = await Review.findOneAndDelete({_id:reviewId,productId:product._id,userId:req.user._id});
    if(!removeReview){
      return res.redirect("/");
    }
    return res.redirect(`/product/${slug}`);
  
  
  } catch(err){
    next(err)
  }
})

router.get("/logout", auth.verifyIfUser, function (req, res, next) {
  req.logout();
  req.flash("message", "Logged out Successfully");
  res.redirect("/");
});

module.exports = router;
