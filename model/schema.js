const mongoose = require('mongoose');


const Schema = mongoose.Schema

const listingSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    image:{
       type:String,
       required:true
    },
    description:String,
    price : Number,
    country:String,
    location:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:'Review'

    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
})

const Listing = mongoose.model('Listing',listingSchema);
module.exports = Listing;