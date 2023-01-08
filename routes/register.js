const express = require('express');
const router = express.Router();
const users = require('../controllers/users')

router.get("/register", users.getFirstRegisterUser)
router.post("/register", users.postFirstRegisterUser)

router.get("/register-password", users.getPassword)
router.post("/register-password", users.postPassword)

module.exports = router;