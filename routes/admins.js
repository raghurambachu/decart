const express = require("express");
const router = express.Router();
const passport = require("passport");
const Admin = require("../models/Admin");
const Vendor = require("../models/Vendor");
const User = require("../models/User");
const auth = require("../middlewares/auth");
const { generateSaltAndHash } = require("../middlewares/auth");
const {
  transporter,
  sendSuccessfulVendorRegistration,
  sendEmailOnUserBlockUnblock,
} = require("../services/nodemailer");

router.get("/", auth.verifyIfAdmin, async function (req, res, next) {
  const admin = req.user;
  try {
    const vendors = await Vendor.find({ isVerified: true });
    res.render("admin/dashboard", { title: "Admin Dashboard", admin, vendors });
  } catch (err) {
    next(err);
  }
});

router.get("/login", function (req, res, next) {
  let error, message;
  errors = req.flash("errors") || null;
  message = req.flash("message") || null;
  res.render("admin/login", { title: "Admin Login", errors, message });
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/admins/login" }),
  function (req, res) {
    res.redirect("/admins/");
  }
);

// router.post("/login", function (req, res, next) {
//   passport.authenticate("local", function (err, admin, info) {
//     if (err) {
//       return next(err);
//     }
//     if (!admin) {
//       req.flash("message", info.message);
//       return res.redirect("/admins/login");
//     } else {
//       console.log(req.user);
//       return res.redirect("/admins/");
//     }
//   })(req, res, next);
// });

// Route for creating admin only for once;
// Should be post but using get
// router.get("/register", async function (req, res, next) {
//   const password = process.env.ADMIN_PASSWORD;
//   try {
//     const { salt, hash } = await generateSaltAndHash(password);
//     const createAdmin = {
//       username: "raghurambachu",
//       displayName: "Raghuram",
//       email: "1993raghuram@gmail.com",
//       mobile: "9869483038",
//       salt,
//       hash,
//       role: "admin",
//     };
//     const admin = await Admin.create(createAdmin);
//     res.send("Admin created successully.");
//   } catch (err) {
//     next(err);
//   }
// });

router.get("/vendors/approve/:vendorId", auth.verifyIfAdmin, async function (
  req,
  res,
  next
) {
  const vendorId = req.params.vendorId;
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isAdminVerified: true },
      { new: true }
    );
    await transporter.sendMail(sendSuccessfulVendorRegistration(vendor));
    return res.redirect("/admins/");
  } catch (err) {
    next(err);
  }
});

router.get("/users/block", auth.verifyIfAdmin, async function (req, res, next) {
  const admin = req.user;
  try {
    const users = await User.find({})
      console.log(users)
    return res.render("admin/blockusers", {
      title: "Block Users",
      admin,
      users,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/users/block/:userId", auth.verifyIfAdmin, async function (
  req,
  res,
  next
) {
  const userId = req.params.userId;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    );
    await transporter.sendMail(sendEmailOnUserBlockUnblock(user, "blocked"));
    return res.redirect("/admins/users/block");
  } catch (err) {
    next(err);
  }
});



router.get("/users/unblock/:userId", auth.verifyIfAdmin, async function (
    req,
    res,
    next
  ) {
    const userId = req.params.userId;
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isBlocked: false },
        { new: true }
      );
      await transporter.sendMail(sendEmailOnUserBlockUnblock(user, "unblocked"));
      return res.redirect("/admins/users/block");
    } catch (err) {
      next(err);
    }
  });


  router.get("/vendors/block", auth.verifyIfAdmin, async function (req, res, next) {
    const admin = req.user;
    try {
      const vendors = await Vendor.find({})
      return res.render("admin/blockvendors", {
        title: "Block Vendors",
        admin,
        vendors,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/vendors/block/:vendorId", auth.verifyIfAdmin, async function (
    req,
    res,
    next
  ) {
    const vendorId = req.params.vendorId;
    try {
      const vendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { isBlocked: true },
        { new: true }
      );
      await transporter.sendMail(sendEmailOnUserBlockUnblock(vendor, "blocked"));
      return res.redirect("/admins/vendors/block");
    } catch (err) {
      next(err);
    }
  });

  router.get("/vendors/unblock/:vendorId", auth.verifyIfAdmin, async function (
    req,
    res,
    next
  ) {
    const vendorId = req.params.vendorId;
    try {
      const vendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { isBlocked: false },
        { new: true }
      );
      await transporter.sendMail(sendEmailOnUserBlockUnblock(vendor, "unblocked"));
      return res.redirect("/admins/vendors/block");
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
