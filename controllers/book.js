const express = require("express");
const router = express.Router();
const sqlInstance = require("mssql");
const multer = require("multer");
const dbConfig = require("../db/connection");
const path = require("path");

const query = {
  getAllData: "SELECT TOP(5) * FROM [dbo].[books_table]",
  addNewBooks:
    "INSERT INTO [dbo].[books_table] (title,publisher,description,image_url) VALUES (@title,@publisher,@description,@image_url) ",
  deleteUser: "DELETE FROM [dbo].[books_table] WHERE name = @userName",
  updateUserDetails:
    "UPDATE [dbo].[books_table] SET password = @newPassword WHERE name = @userName",
};

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

router.post("/add-book", upload.single("imgUploader"), async (req, res, next) => {
    try {
      try {
        
        sqlInstance
          .connect(dbConfig)
          .then(function () {
            new sqlInstance.Request()
              .input("title", sqlInstance.VarChar, req.body.title)
              .input("description", sqlInstance.VarChar, req.body.description)
              .input("publisher", sqlInstance.VarChar, req.body.publisher)
              .input("image_url", sqlInstance.VarChar, req.file.path)
              .query(query.addNewBooks)
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

      res.render("addbooks", { layout: "index" });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    res.render("addbooks", { layout: "index" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
