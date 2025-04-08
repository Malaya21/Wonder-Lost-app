if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const connect = require('./model/db');
const method = require('method-override');
const ejsMate = require('ejs-mate');
const path = require('path');
const ExpressError = require('./utils/ExpresssError');
const listingRoutes = require('./Routes/listing');
const reviewRoutes = require('./Routes/reviews');
const userRoutes = require('./Routes/user');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./model/user');
const app = express();

const sessionOption = {
    secret: 'This is a secret for my session',
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true, // Helps to prevent XSS attacks
    }
};
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success') || null;
    res.locals.error = req.flash('error') || null;
    res.locals.currUser = req.user || null;
    next();
});
app.use(method('_method'));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/listing',listingRoutes);
app.use('/listing/review',reviewRoutes);
app.use('/user',userRoutes);

connect()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((err) => {
        console.log('Database connection failed');
    });
  

app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page not found error'));
});

app.use((err, req, resp, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    console.log(err.name);
    resp.status(status).render('error', { message });
});

app.listen(3000, () => {
    console.log('App is running on port 3000.');
});