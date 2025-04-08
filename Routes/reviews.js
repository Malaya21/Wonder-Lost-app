const express = require('express');
const router = express.Router();
const ExpressError = require("../utils/ExpresssError");
const {reviewSchemaJoi} = require('../joiSchema');
const Review = require('../model/review');
const WrapAsync = require("../utils/WrapAsync");
const Listing = require("../model/schema");
const { isLogin } = require("../utils/IsLogin");
const validateReviews = (req, resp, next) => {
    const { comment, rating } = req.body
    const { error } = reviewSchemaJoi.validate({ comment, rating })
    if (error) {
        throw new ExpressError(400, error); // Throwing custom error if validation fails
    } else {
        next(); // Proceeding to the next middleware or route handler
    }
}
router.post('/', validateReviews,
    WrapAsync(async (req, res) => {
        const { listId, rating, comment } = req.body;

        // Create and save the new review
        const newReview = await new Review({
            rating: rating,
            comment: comment,
            owner: req.user._id
        }).save();

        // Directly push the review ID into the listing's reviews array
        const updatedListing = await Listing.findByIdAndUpdate(
            listId,
            { $push: { reviews: newReview._id } }, // ✅ Directly pushing the review ID
            { new: true, runValidators: true } // ✅ Ensures updated document is returned
        );

        if (!updatedListing) {
           
            return res.status(404).send("Listing not found");
        }

       
        req.flash("success", "Reviews added successfully");
        res.redirect(`/listing/${listId}`); // Redirecting to the listings page
    }));
router.get(
    '/:id',isLogin,
    WrapAsync(async (req, resp) => {
        const { id } = req.params; // Extracting listing ID from URL parameters
        const list = await Listing.findById(id); // Fetching the listing by ID
        resp.render('addreviews', { list }); // Rendering the reviews page with listing data
    })
);
router.get(
    '/:id/edit',isLogin,
    WrapAsync(async (req, resp) => {
        const { id } = req.params; // Extracting review ID from URL parameters
        const {listId} = req.query;
        const review = await Review.findById(id);
        resp.render('editreviews', { review,listId });
    })

);
router.put(
    '/:id',isLogin,
    validateReviews,
    WrapAsync(async (req, resp) => {
        const { id } = req.params; // Extracting listing ID from URL parameters 
        
        const { comment, rating, listId } = req.body;
        const review = await Review.findByIdAndUpdate(id, { comment, rating ,createdAt:Date.now()}, { new: true, runValidators: true });
       
        req.flash("success","Review updated successfully");
        resp.redirect(`/listing/${listId}`);
    })
);
router.delete(
    '/:id',isLogin,
    WrapAsync(async (req, resp) => {
        const { id } = req.params; // Extracting listing ID from URL parameters
        const {listId} = req.query;
        await Review.findByIdAndDelete(id);
        await Listing.findByIdAndUpdate({_id:listId},{$pull:{reviews:id}});
        req.flash("success","Review deleted successfully");
        resp.redirect(`/listing/${listId}`);
    })
);


module.exports = router;