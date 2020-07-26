const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const sqlInstance = require("mssql");
const dbObj = require("../db/connection");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      try {
        sqlInstance
          .connect(dbObj.dbConfig)
          .then(function () {
            new sqlInstance.Request()
              .input("email", sqlInstance.VarChar, email)
              .query(dbObj.query.getUserDetail)
              .then((user) => {
                console.log("Passort Auth USER DATA",user.recordset[0]);
                sqlInstance.close();
                if (!user.recordset[0]) {                  
                  return done(null, false, {
                    message: "That email is not registered",
                  });
                }
                bcrypt.compare(password, user.recordset[0].Password, (err, isMatch) => {
                  if (err) throw err;
                  if (isMatch) {
                    return done(null, user.recordset[0]);
                  } else {
                    return done(null, false, { message: "Password incorrect" });
                  }
                });
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
    })
  );

  passport.serializeUser((user, done) => {
    console.log("Serializer Passport USER",user)
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    console.log("deserializeUser Passport USER",user)
    try {
      sqlInstance
        .connect(dbObj.dbConfig)
        .then(function () {
          new sqlInstance.Request()
            .input("email", sqlInstance.VarChar, user.Email)
            .query(dbObj.query.getUserDetail)
            .then((data) => {
              sqlInstance.close();
              console.log("deserializeUser db data",data.recordset[0])
              done(null, data.recordset[0]);
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  });
};
