const express = require("express");
const slugify = require("slugify");
const passport = require("passport");
const router = express.Router();
const auth = require("../middlewares/auth");
const Vendor = require("../models/Vendor");
const Admin = require("../models/Admin");
const Product = require("../models/Product");
const Category = require("../models/Category")
const cloudinary = require("cloudinary");
const { cloudinaryConfig } = require("../services/cloudinary");
const { multerUploads, dataUris } = require("../services/multer");

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
const uploadFiles = require("../services/multer");
const { create } = require("../models/Vendor");

router.get("/", auth.verifyIfVendor, function (req, res, next) {
  const vendor = req.user;
  res.render("vendor/dashboard", { title: "Dashboard", vendor });
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

    res.redirect(req.session.returnTo || "/vendors/");
    delete req.session.returnTo
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

router.get("/add", auth.verifyIfVendor, async function (req, res, next) {
  try{
    const vendor = req.user;
    const categories = await Category.find()
    res.render("vendor/addproduct", { title: "Add Product",categories ,vendor });

  } catch(err){
    next(err)
  }
});

router.post(
  "/add/:vendorId",
  auth.verifyIfVendor,
  cloudinaryConfig,
  multerUploads,
  async function (req, res, next) {
    const productBody = req.body;

    try {
      let files = dataUris(req);
      files = files.map((file) => file.content);
      // Upload multiple files one after other
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        const image = await cloudinary.v2.uploader.upload(files[i]);
        urls.push(image.url);
      }
      const createProduct = {};
      createProduct.isListed = false;
      createProduct.name = productBody.title;
      createProduct.slug = slugify(productBody.title);
      createProduct.category = productBody.category;
      createProduct.easyPayAvailable = productBody.easyPayAvailable === "true" ? true :false;
      createProduct.policy = productBody.policy
      createProduct.description = productBody.description;
      createProduct.markup = productBody.markup;
      createProduct.quantity = productBody.quantity;
      createProduct.listPrice = productBody.listPrice;
      createProduct.sellingPrice = productBody.sellingPrice;
      createProduct.maxQty = productBody.maxQty;
      createProduct.warranty = productBody.warranty;
      createProduct.images = urls;
      createProduct.createdBy = req.params.vendorId;

      const product = await Product.create(createProduct);
      req.flash("message", "Product added successfully");
      return res.redirect("/vendors/add");
    } catch (err) {
      next(err)
    }
  }
);

router.get("/products",auth.verifyIfVendor,async function(req,res,next){
  const vendor = req.user;
  try{
    
    const products = await Product.find({createdBy:vendor._id});
    res.render("vendor/allproducts",{title:"All Products",products,vendor})
  } catch(err){
    next(err)
  }
})

router.get("/logout", auth.verifyIfVendor, function (req, res, next) {
  req.logout();
  req.flash("message", "Logged out Successfully");
  res.redirect("/vendors/login");
});

module.exports = router;
