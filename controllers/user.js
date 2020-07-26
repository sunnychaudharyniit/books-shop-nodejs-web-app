const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const sqlInstance = require("mssql");
const dbObj = require("../db/connection");
const { forwardAuthenticated } = require("../middleware/auth-middleware");

router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

router.post("/register", (req, res) => {
    console.log("Registration",req.body)
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    try {
      sqlInstance
        .connect(dbObj.dbConfig)
        .then(function () {
          new sqlInstance.Request()
            .input("email", sqlInstance.VarChar, email)
            .query(dbObj.query.getUserDetail)
            .then((user) => {
                console.log("USER DATA - Reg ",user.recordset[0])
              sqlInstance.close();
              if (user.recordset[0]) {
                errors.push({ msg: "Email already exists" });
                res.render("register", {
                  errors,
                  name,
                  email,
                  password,
                  password2,
                });
              } else {
                bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(password, salt, (err, hashPassword) => {
                    if (err) throw err;
                    console.log("Password ",password)                    
                    console.log("Password after hashing ",hashPassword)
                    sqlInstance
                      .connect(dbObj.dbConfig)
                      .then(function () {
                        new sqlInstance.Request()
                          .input("name", sqlInstance.VarChar, name)
                          .input("email", sqlInstance.VarChar, email)
                          .input("password", sqlInstance.VarChar, hashPassword)
                          .query(dbObj.query.addNewUser)
                          .then(function (dbData) {
                            if (dbData == null || dbData.length === 0)
                              return {};
                            console.log(dbData); //return dbData;
                            sqlInstance.close();
                            req.flash(
                              "success_msg",
                              "You are now registered and can log in"
                            );
                            res.redirect("/user/login");
                          })
                          .catch(function (error) {
                            console.log(error);
                          });
                      })
                      .catch(function (error) {
                        console.log(error);
                      });
                  });
                });
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  }
});

router.post("/login", (req, res, next) => {
   // console.log('login',req.body.email)
  passport.authenticate("local", {
    successRedirect: "/book/add",
    failureRedirect: "/user/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/user/login");
});

module.exports = router;
