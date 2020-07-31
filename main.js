const express = require("express");
const app = express()
const bodyparser = require('body-parser')
const fs = require('fs')
const path = require('path')
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const totalCartItem = require("./middleware/cart-item-middleware")

require('./config/passport-auth')(passport);

const route = require("./route/route");
const expressejsLayouts = require('express-ejs-layouts');
app.set("view engine","ejs");
app.set("views",path.join(__dirname,'views'));
app.use(expressejsLayouts)
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/images'));
app.use(bodyparser.json())
// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false
    })
  );
  
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Connect flash
  app.use(flash());
  
  // Global variables
  app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });
  app.use(totalCartItem)

route(app) 


app.listen(process.env.PORT || 2000);