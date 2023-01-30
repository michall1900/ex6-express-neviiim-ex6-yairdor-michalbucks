const express = require('express');
const users = require("../controllers/users");
const router = express.Router();
const db = require("../models")

router.get('/',users.getLoginPage)
router.post('/', users.postLogin)


module.exports = router;