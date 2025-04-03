const express = require('express'); // Importing Express framework
const connect = require('./model/db'); // Importing database connection module
const Listing = require('./model/schema'); // Importing Mongoose schema for listings
const method = require('method-override'); // Importing method-override for HTTP method overrides
const ejsMate = require('ejs-mate'); // Importing ejs-mate for EJS layout support
const path = require('path'); // Importing path module for handling file paths
const ExpressError = require('./utils/ExpresssError'); // Custom error handling class
const WrapAsync = require('./utils/WrapAsync'); // Utility to handle async errors
const listingSchema = require('./joiSchema'); // Joi schema for request validation
const Review = require('./model/review');
const reviewSchemaJoi = require('./joiSchema');

const app = express(); // Initializing Express app

// Middleware setup
app.use(method('_method')); // Allowing method override for PUT and DELETE requests
app.engine('ejs', ejsMate); // Setting ejs-mate as the template engine
app.use(express.urlencoded({ extended: true })); // Parsing URL-encoded data
app.use(express.json()); // Parsing JSON data
app.use(express.static(path.join(__dirname, '/public'))); // Serving static files
app.set('view engine', 'ejs'); // Setting EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Setting the views directory

// Connecting to the database
connect()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((err) => {
        console.log('Database connection failed');
    });

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
const validateReviews = (req,resp,next)=>{
    const {comment,rating} = req.body
    const {error} = reviewSchemaJoi.validate({comment,rating} )    
    if (error) {
        throw new ExpressError(400, error); // Throwing custom error if validation fails
    } else {
        next(); // Proceeding to the next middleware or route handler
    }
}

// Route to display all listings
app.get(
    '/listing',
    WrapAsync(async (req, res) => {
        const lists = await Listing.find({}); // Fetching all listings from the database
        res.render('index', { lists }); // Rendering the index page with listings
    })
);

// Route to render the form for creating a new listing
app.get('/listing/new', (req, res) => {
    res.render('new'); // Rendering the new listing form
});

// Route to create a new listing
app.post(
    '/listing',
    validateListing,
    WrapAsync(async (req, res, next) => {
        const list = new Listing(req.body); // Creating a new listing from request body
        const data = await list.save(); // Saving the listing to the database
        console.log(data);
        res.redirect('/listing'); // Redirecting to the listings page
    })
);
app.post('/review',validateReviews,
    WrapAsync(async (req, res) => {
    const { listId, rating, comment } = req.body;

    // Create and save the new review
    const newReview = await new Review({
        rating: rating,
        comment: comment
    }).save();

    // Directly push the review ID into the listing's reviews array
    const updatedListing = await Listing.findByIdAndUpdate(
        listId,
        { $push: { reviews: newReview._id } }, // ✅ Directly pushing the review ID
        { new: true, runValidators: true } // ✅ Ensures updated document is returned
    );

    if (!updatedListing) {
        console.log("Error: Listing not found");
        return res.status(404).send("Listing not found");
    }

    console.log("New Review Added:", newReview);
    console.log("Updated listing:", updatedListing);
    res.redirect('/listing'); // Redirecting to the listings page
}));

// Route to update an existing listing
app.put(
    '/listing',
    WrapAsync(async (req, res) => {
        const { id, title, description, image, location, price } = req.body; // Extracting data from request body
        console.log(id, title, description, image, location, price);
        const list = await Listing.findByIdAndUpdate(
            id,
            { title, description, image, location, price },
            { new: true, runValidators: true } // Ensuring validation and returning updated document
        );
        console.log(list);
        res.redirect('/listing'); // Redirecting to the listings page
    })
);

// Route to render the edit form for a specific listing
app.get(
    '/listing/:id/edit',
    WrapAsync(async (req, res) => {
        const { id } = req.params; // Extracting listing ID from URL parameters
        const list = await Listing.findById(id); // Fetching the listing by ID
        res.render('edit', { list }); // Rendering the edit form with listing data
    })
);

// Route to display details of a specific listing

app.get(
    '/listing/:id',
    WrapAsync(async (req, resp) => {
        const { id } = req.params; // Extracting listing ID from URL parameters
        const list = await Listing.findById(id).populate('reviews'); // Fetching the listing by ID and populating reviews
    
        resp.render('details', { list }); // Rendering the details page with listing data
        
    })
);
app.get(
    '/listing/:id/review',
    WrapAsync(async (req, resp) => {
        const { id } = req.params; // Extracting listing ID from URL parameters
        const list = await Listing.findById(id); // Fetching the listing by ID
        resp.render('addreviews', { list }); // Rendering the reviews page with listing data
    })
);
// Route to delete a listing
app.delete(
    '/listing',
    WrapAsync(async (req, res) => {
        const { id } = req.body; // Extracting listing ID from request body
        const data = await Listing.findByIdAndDelete(id); // Deleting the listing by ID
        console.log(data);
        res.redirect('/listing'); // Redirecting to the listings page
    })
);

// Catch-all route for handling undefined routes
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page not found error')); // Throwing custom 404 error
});

// Error handling middleware
app.use((err, req, resp, next) => {
    const { status = 500, message = 'Something went wrong' } = err; // Default error values
    console.log(err.name);
    resp.status(status).render('error', { message }); // Rendering the error page
});

// Starting the server
app.listen(3000, () => {
    console.log('App is running on port 3000.');
});