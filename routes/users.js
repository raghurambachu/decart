var express = require("express");
var router = express.Router();
const User = require("../models/User");

const auth = require("../middlewares/auth");
const {
  userRegisterValidationRules,
  validateRegisterForm,
} = require("../utils/validator");

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
      const user = await User.findOne({ email });
      if (user) {
        const provider = user.provider;
        if (provider.includes("local")) {
          req.flash("msg", `${email} already registered, try logging in.`);
          return res.redirect("/users/login");
        } else {
          req.flash(
            "msg",
            `${email} registered using Google Auth, try loggin in using Google Auth.`
          );
          return res.redirect("users/login");
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
          "msg",
          "Please verify your email, by clicking on the link sent to your registered email."
        );
        return res.redirect("/users/login");
      }
    } catch (err) {
      next(err);
    }
  }
);

router.get("/login", function (req, res, next) {
  let errors, msg;
  errors = req.flash("errors") || null;
  msg = req.flash("msg") || null;
  res.render("user/login", {
    title: "Login",
    email: "",
    password: "",
    errors: errors,
    msg: msg,
  });
});

module.exports = router;
