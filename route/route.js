const book = require("../controllers/book")
const user = require("../controllers/user");

module.exports = (app)=>{
    app.use("/book",book)
    app.use("/user",user)
}