
module.exports = {
    ensureAuthenticated:  function(req, res, next) {
      if (req.isAuthenticated()) {
        res.locals.isAuthenticated = true;
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
  