const express = require("express");
const router = express.Router();
const sqlInstance = require("mssql");
const multer = require("multer");
const dbObj = require("../db/connection");
const bcrypt = require('bcryptjs');
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

router.post("/add-book",ensureAuthenticated, upload.single("imgUploader"), async (req, res, next) => {   
      try {        
        sqlInstance
          .connect(dbObj.dbConfig)
          .then(function () {
            new sqlInstance.Request()
              .input("title", sqlInstance.VarChar, req.body.title)
              .input("description", sqlInstance.VarChar, req.body.description)
              .input("publisher", sqlInstance.VarChar, req.body.publisher)
              .input("image_url", sqlInstance.VarChar, req.file.path)
              .query(dbObj.query.addNewBooks)
              .then(function (dbData) {
                if (dbData == null || dbData.length === 0) return {};
                console.log(dbData); //return dbData;
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
      res.render("addbooks");
    } 
);

router.get("/add",ensureAuthenticated, async (req, res, next) => {
  console.log("dashbord",req.user)
  try {
    res.render("addbooks");
  } catch (err) {
    next(err);
  }
});

router.get("/books-list",ensureAuthenticated, async (req, res, next) => {  
  try {
    res.render("books-list");
  } catch (err) {
    next(err);
  }
});

router.get("/all-books",ensureAuthenticated, async (req, res, next) => {  
  try {
    res.render("all-books");
  } catch (err) {
    next(err);
  }
});

router.get("/cart",ensureAuthenticated, async (req, res, next) => {  
  try {
    res.render("cart");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
