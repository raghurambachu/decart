var express = require("express");
const Product = require("../models/Product");
const Banner = require("../models/Banner");
const Category = require("../models/Category");
const { verifyIfUser } = require("../middlewares/auth");
const Cart = require("../models/Cart");
const Review = require("../models/Review");
var router = express.Router();

/* GET home page. */
router.get("/",async function (req, res, next) {
  try{
    const banners = await Banner.find().populate("productId","_id name slug");
    const products = await Product.find();
    const categories = await Category.find();
    res.render("index", { title: "Decart",categories,banners,products });

  } catch(err){
    next(err)
  }
});

router.get("/search",function(req,res,next){
  const searchTerm = req.query.s;
  
  Product.find({
    "$or": [
     {"name" : { $regex: new RegExp(searchTerm) , $options: 'ig' }} ,
     {"description": { $regex: new RegExp(searchTerm) , $options: 'ig' }}
    ]
  }, {
    _id : 0,
    __v : 0
  }, function(err,searchResult){
    if(err) return next(err);

    res.render("search",{title:"Products Page",products:searchResult,searchTerm})
  }).limit(5);
})

router.get("/product/:slug",async function(req,res,next){
  const user = req.user || null;
  try{
    console.log(req.user)
    const slug = req.params.slug;
    const product = await  Product.findOne({slug}).populate("createdBy","_id displayName").exec();
    if(!product){
      // need to change(ntc) - Not Found Page
      return res.send("Page Not Found")
    } else {
      const reviews = await Review.find({productId:product._id}).populate("userId","_id displayName username").exec()
      const userHasReviewed = reviews.some(review => review.userId._id.toString() === user._id.toString())
      res.render("product",{title:product.title,product,user,reviews,userHasReviewed})
    }
  }catch(err){
    next(err)
  }
})



router.get("/category/:category",async function(req,res,next){
  
  let filter = req.query.filter || "newest";
  let sort;
  if(filter === "newest"){
    sort = {updatedAt:-1}
  } else if(filter === "price-desc"){
    sort = {sellingPrice:1}
  } else {
    sort = {sellingPrice:-1}
  }
  try{
    const category = req.params.category;
    const products = await Product.find({category}).sort(sort).populate("createdBy","_id displayName username").exec()
    res.render("category",{title:category, products,filter})
  }catch(err){
    next(err);
  }
})




module.exports = router;
