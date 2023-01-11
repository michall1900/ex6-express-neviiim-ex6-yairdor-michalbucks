const express = require('express');
const router = express.Router();
const users = require('../controllers/users')
const forAll = require('./forAll')

router.use("/*", users.getUserDataFromCookie)

router.get("/register", users.getFirstRegisterPage)
router.post("/register", users.postFirstRegisterPage)

router.get("/register-password", users.getPassword)
router.post("/register-password", users.postPassword)

module.exports = router;