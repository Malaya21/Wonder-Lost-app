const mongoose = require('mongoose');


const Schema = mongoose.Schema

const listingSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    image:{
        type:String,
        default:"https://imgs.search.brave.com/OIRecmsGTMIERIP_NB6JtGSsfZUNcX-H0qDEt-fyhUU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20vYWl0ZXN0a2l0Y2hlbi93ZWJzaXRlL2NvbnRlbnQvaW1hZ2UtZngtcGxlYXNlLXNpZ24taW4ud2VicA",
        set:(v)=>v===""?"https://imgs.search.brave.com/OIRecmsGTMIERIP_NB6JtGSsfZUNcX-H0qDEt-fyhUU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20vYWl0ZXN0a2l0Y2hlbi93ZWJzaXRlL2NvbnRlbnQvaW1hZ2UtZngtcGxlYXNlLXNpZ24taW4ud2VicA":v
    },
    description:String,
    price : Number,
    country:String,
    location:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:'Review'

    }]
})

const Listing = mongoose.model('Listing',listingSchema);
module.exports = Listing;