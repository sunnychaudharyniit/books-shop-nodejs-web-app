const express = require("express");
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        var drinks = [
        { name: 'Bloody Mary', drunkness: 3 },
        { name: 'Martini', drunkness: 5 },
        { name: 'Scotch', drunkness: 10 }
    ];
        res.render("addbooks",{ layout: 'index',drinks })
    }
    catch (err) {
        next(err)
    }
});

router.get('/', async (req, res, next) => {
    try {
        var drinks = [
        { name: 'Bloody Mary', drunkness: 3 },
        { name: 'Martini', drunkness: 5 },
        { name: 'Scotch', drunkness: 10 }
    ];
        res.render("addbooks",{ layout: 'index',drinks })
    }
    catch (err) {
        next(err)
    }
});

module.exports = router;

