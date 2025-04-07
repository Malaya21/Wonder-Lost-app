const express = require("express");
const router = express.Router();
const Listing = require("../model/schema");

const {listingSchema} = require("../joiSchema");

const WrapAsync = require("../utils/WrapAsync");
const ExpressError = require("../utils/ExpresssError");
const { isLogin, isOwner } = require("../utils/IsLogin");

// Middleware to validate listing data using Joi schema
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error); // Throwing custom error if validation fails
    } else {
        next(); // Proceeding to the next middleware or route handler
    }
};
//Middleware to validate reviews schema

// Route to display all listings
router.get(
    "/",
    WrapAsync(async (req, res) => {
        const lists = await Listing.find({}); // Fetching all listings from the database
        res.render("index", { lists }); // Rendering the index page with listings
    })
);

// Route to render the form for creating a new listing
router.get("/new",isLogin, (req, res) => {
    res.render("new"); // Rendering the new listing form
});

// Route to create a new listing
router.post(
    "/",
    validateListing,
    WrapAsync(async (req, res, next) => {
        const list = new Listing(req.body); // Creating a new listing from request body
        list.owner = req.user._id;
         await list.save(); // Saving the listing to the database
       req.flash("success", "Listing created successfully"); // Flash message for success
        res.redirect("/listing"); // Redirecting to the listings page
    })
);

// Route to update an existing listing
router.put(
    "/",isLogin,isOwner,
    WrapAsync(async (req, res) => {
        const { id, title, description, image, location, price } = req.body; // Extracting data from request body
        console.log(id, title, description, image, location, price);
        const list = await Listing.findByIdAndUpdate(
            id,
            { title, description, image, location, price },
            { new: true, runValidators: true } // Ensuring validation and returning updated document
        );
        console.log(list);
        req.flash("success", "Listing Updated successfully!");
        res.redirect(`/listing/${id}`); // Redirecting to the listings page
    })
);


// Route to render the edit form for a specific listing
router.get(
    "/:id/edit",isLogin,isOwner,
    WrapAsync(async (req, res) => {
        const { id } = req.params; // Extracting listing ID from URL parameters
        const list = await Listing.findById(id); // Fetching the listing by ID
        res.render("edit", { list }); // Rendering the edit form with listing data
    })
);

// Route to display details of a specific listing

router.get(
    "/:id",
    WrapAsync(async (req, resp) => {
        const { id } = req.params; // Extracting listing ID from URL parameters
        const list = await Listing.findById(id).populate({path:"reviews",populate:{path:"owner"}}).populate("owner"); // Fetching the listing by ID and populating reviews
        console.log(list);
        

        resp.render("details", { list }); // Rendering the details page with listing data
    })
);

// Route to delete a listing
router.delete(
    "/",isLogin,isOwner,
    WrapAsync(async (req, res) => {
        const { id } = req.body; // Extracting listing ID from request body
        const data = await Listing.findByIdAndDelete(id); // Deleting the listing by ID
        console.log(data);
        req.flash("success", "Listing Deleted successfully");
        res.redirect("/listing"); // Redirecting to the listings page
    })
);

module.exports = router;
