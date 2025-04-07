const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const User = require('../model/user');
const wrapAsync = require('../utils/WrapAsync');
const passport = require('passport');
const { isLogin, saveRedirectUrl } = require('../utils/IsLogin');
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

module.exports = router;
