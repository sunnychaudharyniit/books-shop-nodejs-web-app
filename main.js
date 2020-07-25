const express = require("express");
const app = express()
const bodyparser = require('body-parser')
const fs = require('fs')
const path = require('path')

const route = require("./route/route");
const expressejsLayouts = require('express-ejs-layouts');
app.set("view engine","ejs");
app.set("views",path.join(__dirname,'views'));
app.use(expressejsLayouts)


app.use(express.static(__dirname + '/assets'));
app.use(bodyparser.json())
route(app) 


app.listen(process.env.PORT || 2000);