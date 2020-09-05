const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    products:[
        {
            type:Schema.Types.ObjectId,
            ref:"Product"
        }
    ],
    totalSellingPrice:{
        type:Number,
        required:true,
    },
    totalListPrice:{
        type:Number,
        required:true,
    },
    quantity:[Number],
    razorPayOrderId:{
        type:String,
        required:true,
    },
    razorPayPaymentId:{
        type:String,
        required:true
    }
})

const Item = mongoose.model("Item",itemSchema);
module.exports = Item;