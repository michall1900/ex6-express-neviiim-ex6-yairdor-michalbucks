const express = require('express');
const error = require("../controllers/error");
const cache = require("../controllers/cache")
const router = express.Router();



router.use((req,res,next) =>{
    req.data = {}
    next()
})
router.use(cache.setCache)
router.use(error.getErrorCookie)

router.use((req,res,next)=>{
    const isLogin = !!(req.session && req.session.isLogin)
    const isTryingToGetAfterLoginPage = req.url.includes("/home")
    if (isLogin === isTryingToGetAfterLoginPage)
        next()
    else if (isLogin && !isTryingToGetAfterLoginPage)
        res.redirect('/home')
    else
        res.redirect('/')
})


module.exports = router;