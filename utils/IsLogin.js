const Listing = require("../model/schema");

const isLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectTo = req.originalUrl;
       
        req.flash('error', 'You must be logged in to access this page');
      
        return res.redirect('/user/login');
    }
    next();
};
const saveRedirectUrl = (req, res, next) => {   
    res.locals.redirectTo = req.session.redirectTo;
    next();
};
const isOwner = async(req, res, next) => {
    const {id} = req.body;
    const listing = await Listing.findById(id);
    if(listing.owner._id.toString() !== req.user._id.toString()){
        req.flash('error', 'You are not authorized to access this page');
        return res.redirect('/listing');
    }
  
    
   
    
    next();
};
module.exports = { isLogin, saveRedirectUrl, isOwner };
