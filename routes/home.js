const express = require('express');
const router = express.Router();
const homePage = require('../controllers/home')

router.get("/", homePage.getHome);

module.exports = router;