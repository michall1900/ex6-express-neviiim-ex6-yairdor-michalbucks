const express = require('express');
const error = require("../controllers/error");
const cache = require("../controllers/cache")
const router = express.Router();

router.use(cache.setCache)
router.use(error.getErrorCookie)


module.exports = router;