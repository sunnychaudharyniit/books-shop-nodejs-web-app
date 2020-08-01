const dbObj = require("../db/connection");

module.exports = {
    ensureAuthenticated: async function(req, res, next) {
      if (req.isAuthenticated()) {
        res.locals.isAuthenticated = true;
        let count = await dbObj.totalCartItems(req.user.User_Id);
        res.locals.totalCartItems = count;
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/user/login');
    },
    forwardAuthenticated:  function(req, res, next) {
      if (!req.isAuthenticated()) {        
        res.locals.isAuthenticated = false; 
        return next();
      }
      res.redirect('/book/add');      
    }
  };
  