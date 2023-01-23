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
    const isTryingToGetHome = req.url.includes("/home")
    if (isLogin === isTryingToGetHome)
        next()
    else if (isLogin && !isTryingToGetHome) {
        //should return json or something like that
        res.redirect('/home')
    }
    else
        res.redirect('/')
})


module.exports = router;