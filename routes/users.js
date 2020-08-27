var express = require("express");
const passport = require("passport");

var router = express.Router();
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Admin = require("../models/Admin");

const auth = require("../middlewares/auth");
const {
  userRegisterValidationRules,
  validateRegisterForm,
  verifyUserIdRules,
  validateVerifyUserIdRules,
  verifyUserFormRules,
  validateVerifyUserFormRules,
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
    res.redirect("/");
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
    console.log(req.user);
    res.redirect("/users/");
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

module.exports = router;
