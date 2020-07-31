const dbObj = require("../db/connection");

module.exports = async function (req, res, next) {
  if (req.isAuthenticated()) {
    let count = await dbObj.totalCartItems(req.user.User_Id);
    //console.log("COUNTER", count);
    res.locals.totalCartItems = count;
  }
  return next();
};
