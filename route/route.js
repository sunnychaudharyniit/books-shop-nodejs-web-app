const book = require("../controllers/book")

module.exports = (app)=>{
    app.use("/book",book)
}