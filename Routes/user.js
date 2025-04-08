const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const User = require('../model/user');
const wrapAsync = require('../utils/WrapAsync');
const passport = require('passport');
const { isLogin, saveRedirectUrl } = require('../utils/IsLogin');
const Listing = require('../model/schema');

router.get('/signup', (req, res) => {
   res.render('users/signup');
});

router.post('/signup', wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
         const registeredUser = await User.register(user, password);
         req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            req.flash('success', 'Welcome to Wonder Lost');
            res.redirect('/listing');
         })
      
        
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/user/signup');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login',saveRedirectUrl, passport.authenticate('local', { failureFlash: true, failureRedirect: '/user/login' }), wrapAsync(async (req, res) => {
    const redirectUrl = res.locals.redirectTo || '/listing';
    req.flash('success', 'Logged in successfully');
    
    res.redirect(redirectUrl);
}));

router.get('/logout',  (req, res, next) => {
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash('success', 'Logged out successfully');
        res.redirect('/listing');
    });
    
});

router.get('/profile', isLogin, wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render('users/profile', { user });
}));

// Email Update Route
router.post('/update-email', isLogin, wrapAsync(async (req, res) => {
    const { email } = req.body;
    const userId = req.user._id;

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        req.flash('error', 'Please enter a valid email address');
        return res.redirect('/user/profile');
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
        req.flash('error', 'This email is already registered');
        return res.redirect('/user/profile');
    }

    // Update email
    await User.findByIdAndUpdate(userId, { email });
    req.flash('success', 'Email updated successfully');
    res.redirect('/user/profile');
}));

// Password Update Route
router.post('/update-password', isLogin, wrapAsync(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id);


    // Check if passwords match
    if (newPassword !== confirmPassword) {
        req.flash('error', 'New passwords do not match');
        return res.redirect('/user/profile');
    }

    // Validate current password
    try {
        // First verify current password
        const isPasswordValid = await user.authenticate(currentPassword);
        if (!isPasswordValid) {
            req.flash('error', 'Current password is incorrect');
            return res.redirect('/user/profile');
        }

        // If current password is correct, update to new password
        await user.setPassword(newPassword);
        await user.save();
        req.flash('success', 'Password updated successfully');
    } catch (err) {
        req.flash('error', 'Something went wrong. Please try again.');
    }
    
    res.redirect('/user/profile');
}));

// User's Listings Route
router.get('/my-listings', isLogin, wrapAsync(async (req, res) => {
    const userId = req.user._id;
    const listings = await Listing.find({ owner: userId });
    res.render('users/my-listings', { listings });
}));

module.exports = router;
