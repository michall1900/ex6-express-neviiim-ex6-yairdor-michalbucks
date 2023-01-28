const express = require('express');
const error = require("../controllers/error");
const cache = require("../controllers/cache")
const router = express.Router();
const authorizeCheck = require("../controllers/authorizeCheck")

router.use((req,res,next) =>{
    req.data = {}
    next()
})
router.use(cache.setCache)
router.use(error.getErrorCookie)

router.use(authorizeCheck.getAuthorizeCheck)


module.exports = router;