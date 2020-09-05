const express = require("express");
const router = express.Router();
const passport = require("passport");
const Admin = require("../models/Admin");
const Vendor = require("../models/Vendor");
const User = require("../models/User");
const Category = require("../models/Category")
const Banner = require("../models/Banner");

const cloudinary = require("cloudinary");
const {dataUri,multerUploadsSingle} = require("../services/multer-single")
const {cloudinaryConfig} = require("../services/cloudinary")
const auth = require("../middlewares/auth");
const { generateSaltAndHash } = require("../middlewares/auth");
const {
  transporter,
  sendSuccessfulVendorRegistration,
  sendEmailOnUserBlockUnblock,
} = require("../services/nodemailer");
const Product = require("../models/Product");

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
    res.redirect(req.session.returnTo || "/admins/");
    delete req.session.returnTo
  }
);


// Route for creating admin only for once;
// Should be post but using get
router.get("/register", async function (req, res, next) {
  const password = process.env.ADMIN_PASSWORD;
  try {
    const { salt, hash } = await generateSaltAndHash(password);
    const createAdmin = {
      username: "raghurambachu",
      displayName: "Raghuram",
      email: "1993raghuram@gmail.com",
      mobile: "9869483038",
      salt,
      hash,
      role: "admin",
    };
    const admin = await Admin.create(createAdmin);
    res.send("Admin created successully.");
  } catch (err) {
    next(err);
  }
});

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
    const users = await User.find({});
    console.log(users);
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

router.get("/vendors/block", auth.verifyIfAdmin, async function (
  req,
  res,
  next
) {
  const admin = req.user;
  try {
    const vendors = await Vendor.find({});
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
    await transporter.sendMail(
      sendEmailOnUserBlockUnblock(vendor, "unblocked")
    );
    return res.redirect("/admins/vendors/block");
  } catch (err) {
    next(err);
  }
});

router.get("/categories",auth.verifyIfAdmin,async function(req,res,next){
  try{
    const message = req.flash("message")
    const categories = await Category.find().populate("createdBy","displayName _id").exec();
    const admin = req.user
    res.render("admin/categories",{title:"Add Categories",message,categories,admin})
  } catch(err){
    next(err)
  }
})

router.post("/categories/:adminId",auth.verifyIfAdmin,async function(req,res,next){
  try{
    const adminId = req.params.adminId;
    let {name,createdBy} = req.body;
    name = name[0].toUpperCase() + name.slice(1);
    // Check if category already exists.
    const categoryExists = await Category.findOne({name});
    if(categoryExists){
      req.flash("message",`Category with ${name} already exists.`)
      return res.redirect("/admins/categories");
    } else {
      const createCategory = {
        name,
        createdBy
      }
  
      const category = await Category.create(createCategory);
      req.flash("message","Category added successfully")
      return res.redirect("/admins/categories")
    }
  }catch(err){
    next(err)
  }
})

router.get("/categories/delete/:categoryId",auth.verifyIfAdmin, async function(req,res,next){
  const categoryId = req.params.categoryId;
  // Check if category exists
  try{
    const category = await Category.findById(categoryId);
  if(category){
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    req.flash("message",`Successfully deleted the category with name ${deletedCategory.name}`)
    return res.redirect("/admins/categories");
  } else {
    req.flash("message","There is no such category to delete.")
    return res.redirect("/admins/categories")
  }
  } catch(err){
    next(err)
  }
})

router.get("/products",auth.verifyIfAdmin,async function(req,res,next){
  // Display all products. 
  try{
    const admin = req.user;
    const message = req.flash("message") || null
    const products = await Product.find();
    res.render("admin/adminlistproducts",{title:"List Products",message,admin,products})
  }catch(err){
    next(err);
  }
})


router.get("/banner/:productSlug",auth.verifyIfAdmin, async function(req,res,next){
  try{
    const slug = req.params.productSlug;
    const message = req.flash("message") || null
    const admin = req.user;
    const product = await Product.findOne({slug});
    const allBanners = await Banner.find().populate("productId","name _id");
    if(!product){
      req.flash("message","There is no such product.");
      return res.redirect("/admins/products")
    }
    // If product exists create a form with Banner
    res.render("admin/addbanner",{title:"Add Banner",allBanners,admin,product,message})

  }catch(err){
    next(err)
  }
})

router.get("/banner/delete/:bannerId",auth.verifyIfAdmin, async function(req,res,next){
  const bannerId = req.params.bannerId;
  try{
    const bannerExists = await Banner.findById(bannerId);
    if(!bannerExists){
      req.flash("message","No such banner exists");
    }else {
      const deleteBanner = await Banner.findByIdAndDelete(bannerId);
      req.flash("message","Banner deleted successfully. To add banner to any product hover on product to add banner.")
    }
    return res.redirect("/admins/products")
  }catch(err){
    next(err)
  }
})

router.post("/banner/:productId",auth.verifyIfAdmin, cloudinaryConfig,multerUploadsSingle, async function(req,res,next){
  if(req.file){
   try{
    //  Check if banner already exists for the product
    // If exists update with the new banner;
    const admin = req.user;
    const slug = req.body.slug
    const file = dataUri(req).content;
    const image = await cloudinary.v2.uploader.upload(file);
    const bannerExists = await  Banner.findOne({productId:req.body.productId});
      console.log(bannerExists)
    if(bannerExists){
      // update banner
      
      const banner = await Banner.findOneAndUpdate({productId:req.body.productId},{banner:image.url},{new:true});
      console.log(banner)
      req.flash("message","Banner Updated successfully");
      return res.redirect(`/admins/banner/${slug}`);
    }
    const createBanner = {
      banner: image.url,
      productId:req.params.productId,
      createdBy: admin._id
    }
    const banner = await Banner.create(createBanner);
    return res.redirect(`/admins/banner/${slug}`)
   }catch(err){
     next(err)
   }
   
  }
})

router.get("/logout", auth.verifyIfAdmin, function (req, res, next) {
  req.logout();
  req.flash("message", "Logged out Successfully");
  res.redirect("/admins/login");
});

module.exports = router;
