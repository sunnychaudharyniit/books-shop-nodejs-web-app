const express = require("express");
const router = express.Router();
const sqlInstance = require("mssql");
const multer = require("multer");
const dbObj = require("../db/connection");
const bcrypt = require("bcryptjs");
const path = require("path");
const { ensureAuthenticated } = require("../middleware/auth-middleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    // Accept and save file
    cb(null, true);
  } else {
    // reject file
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.post(
  "/add-book",
  ensureAuthenticated,
  upload.single("imgUploader"),
  async (req, res, next) => {
    try {
      req.body.cat_id = parseInt(req.body.cat_id);
      req.file.filename = "/" + req.file.filename;
      sqlInstance
        .connect(dbObj.dbConfig)
        .then(function () {
          new sqlInstance.Request()
            .input("title", sqlInstance.VarChar, req.body.title)
            .input("description", sqlInstance.VarChar, req.body.description)
            .input("publisher", sqlInstance.VarChar, "Default")
            .input("cat_id", sqlInstance.Int, req.body.cat_id)
            .input("price", sqlInstance.Int, req.body.price)
            .input("image_url", sqlInstance.VarChar, req.file.filename)
            .query(dbObj.sqlQuery.addNewBooks)
            .then(function (dbData) {
              if (dbData == null || dbData.length === 0) return {};
              //console.log(dbData); //return dbData;
              sqlInstance.close();
              return res.redirect("/book/products");
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
);

router.post("/buy-book", ensureAuthenticated, async (req, res, next) => {
  try {
    sqlInstance
      .connect(dbObj.dbConfig)
      .then(function () {
        new sqlInstance.Request()
          .input("title", sqlInstance.VarChar, req.body.title)
          .input("description", sqlInstance.VarChar, req.body.description)
          .input("publisher", sqlInstance.VarChar, "Default")
          .input("cat_id", sqlInstance.Int, req.body.cat_id)
          .input("image_url", sqlInstance.VarChar, req.file.filename)
          .query(dbObj.sqlQuery.addNewBooks)
          .then(function (dbData) {
            if (dbData == null || dbData.length === 0) return {};
            //console.log(dbData); //return dbData;
            sqlInstance.close();
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
  return res.redirect("/book/products");
});

router.get("/add", ensureAuthenticated, async (req, res, next) => {
  try {
    await sqlInstance.connect(dbObj.dbConfig);
    const allCategory = await new sqlInstance.Request().query(
      dbObj.sqlQuery.getAllCategory
    );
    sqlInstance.close();
    const viewData = {
      categoryList: allCategory.recordset,
    };
    //console.log(viewData);
    res.render("addbooks", viewData);
  } catch (err) {
    next(err);
  }
});

router.get("/products", ensureAuthenticated, async (req, res, next) => {
  try {
    try {
      //console.log(req.user);
      await sqlInstance.connect(dbObj.dbConfig);
      var allBooks = {};
      if (req.query.cat_id) {
        req.query.cat_id = parseInt(req.query.cat_id);
        allBooks = await new sqlInstance.Request()
          .input("cat_id", sqlInstance.Int, req.query.cat_id)
          .query(dbObj.sqlQuery.getFilteredBooks);
      } else {
        allBooks = await new sqlInstance.Request().query(
          dbObj.sqlQuery.getAllBooks
        );
      }

      const userCartItems = await new sqlInstance.Request()
        .input("user_id", sqlInstance.Int, req.user.User_Id)
        .query(dbObj.sqlQuery.getUserCartItems);
      
      if (allBooks.recordset) {
        if (allBooks.recordset.length > 0) {
          if (userCartItems.recordset) {
            if (userCartItems.recordset.length > 0) {
              allBooks.recordset.map((x) => {
                let cart = userCartItems.recordset.find(
                  (i) => i.book_id == x.book_id
                );
                if (cart) {
                  x["quantity"] = cart.quantity ? cart.quantity : 0;
                } else {
                  x["quantity"] = 0;
                }
              });
            } else {
              allBooks.recordset.map((x) => {
                x["quantity"] = 0;
              });
            }
          }
        }
      }
      console.log(" allBooks.recordset", allBooks.recordset)
      const allCategory = await new sqlInstance.Request().query(
        dbObj.sqlQuery.getAllCategory
      );
      sqlInstance.close();
      const viewData = {
        categoriesList: allCategory.recordset,
        booksList: allBooks.recordset,
        user: req.user,
      }; 
      //console.log(viewData, userCartItems.recordset);
      
      res.render("products", viewData);
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/addToCart", ensureAuthenticated, async (req, res, next) => {
  try {
    req.body.quantity = parseInt(req.body.quantity);
    req.body.book_id = parseInt(req.body.book_id);
    req.body.price_per_item = parseInt(req.body.price_per_item);
    req.body.user_id = parseInt(req.body.user_id);
    await sqlInstance.connect(dbObj.dbConfig);
    console.log(req.body.quantity,req.body.book_id);
    if (req.body.quantity == 0) {
      req.body.quantity = 1;
      const total_price = req.body.price_per_item * req.body.quantity;
      const cart = await new sqlInstance.Request()
        .input("book_id", sqlInstance.Int, req.body.book_id)
        .input("price_per_item", sqlInstance.Int, req.body.price_per_item)
        .input("user_id", sqlInstance.Int, req.body.user_id)
        .input("total_price", sqlInstance.Int, total_price)
        .input("quantity", sqlInstance.Int, req.body.quantity)
        .query(dbObj.sqlQuery.addItemToCart);
    } else if (req.body.quantity > 0) {
      req.body.quantity += 1;
      const total_price = req.body.price_per_item * req.body.quantity;
      const cart = await new sqlInstance.Request()
        .input("book_id", sqlInstance.Int, req.body.book_id)
        .input("total_price", sqlInstance.Int, total_price)
        .input("quantity", sqlInstance.Int, req.body.quantity)
        .query(dbObj.sqlQuery.updateItemToCart);
    }

    sqlInstance.close();
    return res.redirect("/book/products");
  } catch (error) {
    console.log(error);
  }
});

router.get("/books-list", ensureAuthenticated, async (req, res, next) => {
  try {
    res.render("books-list");
  } catch (err) {
    next(err);
  }
});

router.get("/cart", ensureAuthenticated, async (req, res, next) => {
  try {
    res.render("cart");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
