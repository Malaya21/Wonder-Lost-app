const joi = require('joi');

const listingSchema = joi.object({
   
        title: joi.string().required(),
        image: joi.string().allow("", null),
        price: joi.number().required().min(0),
        description: joi.string().required(),
        location: joi.string().required(),
   
});



const reviewSchemaJoi  = joi.object({
        rating:joi.number().required().min(1).max(5),
        comment:joi.string().required()
}) 
module.exports = {reviewSchemaJoi,listingSchema};