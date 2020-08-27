const express = require("express");
const passport = require("passport");
const router = express.Router();
const auth = require("../middlewares/auth");
const Vendor = require("../models/Vendor");
const Admin = require("../models/Admin");
const {
  transporter,
  sendAdminVerificationPending,
} = require("../services/nodemailer");
const {
  vendorRegisterValidationRules,
  validateVendorRegisterForm,
  verifyVendorIdRules,
  validateVerifyVendorIdRules,
  verifyVendorFormRules,
  validateVerifyVendorFormRules,
} = require("../utils/vendor-validator");

router.get("/", function (req, res, next) {
  res.render("vendor/dashboard", { title: "Dashboard" });
});

router.get("/register", function (req, res, next) {
  let errors;
  errors = req.flash("errors") || null;
  res.render("vendor/register", {
    title: "Vendor Register",
    errors: errors,
  });
});

router.post(
  "/register",
  vendorRegisterValidationRules(),
  validateVendorRegisterForm,
  async function (req, res, next) {
    const vendor = req.body;
    const { username, email, password } = vendor;
    // search if vendor is already registered.
    try {
      const admin = await Admin.findOne({ email });
      if (admin) {
        req.flash(
          "errors",
          `${email} is already registered. Try with different email id.`
        );
        return res.redirect("/vendors/register");
      }
      const vendor = await Vendor.findOne({ email });
      if (vendor) {
        req.flash(
          "message",
          "Vendor Email is already registered. Try logging in with your credentials"
        );
        return res.redirect("/vendors/login");
      } else {
        const { salt, hash } = await auth.generateSaltAndHash(password);
        let newVendor = {
          username,
          email,
          salt,
          hash,
          displayName: username[0].toUpperCase() + username.slice(1),
          isVerified: false,
          role: "vendor",
          isBlocked: false,
          isAdminVerified: false,
        };
        let vendor = new Vendor(newVendor);
        vendor = await vendor.save();
        req.flash(
          "message",
          "Please verify your email, by clicking on the link sent to your registered email."
        );
        return res.redirect("/vendors/login");
      }
    } catch (err) {
      next(err);
    }
  }
);

router.get("/login", function (req, res, next) {
  let error, message;
  errors = req.flash("errors") || null;
  message = req.flash("message") || null;
  res.render("vendor/login", { title: "Vendor Login", errors, message });
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/vendors/login" }),
  function (req, res) {
    console.log(req.user);
    res.redirect("/vendors/");
  }
);

// router.post("/login", function (req, res, next) {
//   passport.authenticate("local", function (err, vendor, info) {
//     if (err) {
//       return next(err);
//     }
//     if (!vendor) {
//       req.flash("message", info.message);
//       return res.redirect("/vendors/login");
//     } else {
//       return res.redirect("/vendors");
//     }
//   })(req, res, next);
// });

router.get(
  "/verify/:vendorId",
  verifyVendorIdRules(),
  validateVerifyVendorIdRules,
  function (req, res, next) {
    const vendorId = req.params.vendorId;
    let errors = req.flash("errors") || null;
    res.render("vendor/verify", {
      vendorId,
      title: "Verify Vendor Email",
      errors,
    });
  }
);

router.post(
  "/verify/:vendorId",
  verifyVendorFormRules(),
  validateVerifyVendorFormRules,
  async function (req, res, next) {
    const vendorId = req.params.vendorId;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      req.flash(
        "message",
        "The verification link is invalid, please click on the link that was sent to your Email"
      );
      return res.redirect("/vendors/login");
    }
    if (vendor.code !== req.body.code) {
      req.flash(
        "message",
        "The code entered is invalid, please type the code that was sent to your registered Email"
      );
      return res.redirect("/vendors/login");
    }
    // If code and mobile is valid then need to store into db
    //Also code needs to be deleted and isVerified:true,
    try {
      const updatedVendor = await Vendor.findByIdAndUpdate(
        vendorId,
        {
          isVerified: true,
          mobile: req.body.mobile,
        },
        { new: true }
      );
      await transporter.sendMail(sendAdminVerificationPending(updatedVendor));
    } catch (err) {
      next(err);
    }
    req.flash(
      "message",
      "Successfully verified your email.Now you are pending for admin approval. Post that you can publish your products"
    );
    return res.redirect("/vendors/login");
  }
);

module.exports = router;
