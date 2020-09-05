const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    banner:{
        type:String,
        required:true
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"Admin"
    },
    productId:{
        type:Schema.Types.ObjectId,
        ref:"Product"
    }
},{timestamps:true})

const Banner = mongoose.model("Banner",bannerSchema);
module.exports = Banner