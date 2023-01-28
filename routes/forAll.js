const express = require('express');
const error = require("../controllers/error");
const cache = require("../controllers/cache")
const router = express.Router();
const cookiesHandler = require('../modules/cookiesHandler.js')
const constants = require("../modules/constantsErrorMessageModule.js");


router.use((req,res,next) =>{
    req.data = {}
    next()
})
router.use(cache.setCache)
router.use(error.getErrorCookie)

router.use((req,res,next)=>{
    const isLogin = !!(req.session.isLogin)
    const isTryingToGetHome = req.url.startsWith("/home")
    const isTryingToGetRegister = req.url === ("/") || req.url.startsWith("/users/register")
    const isFetch = req.headers && req.headers['x-is-fetch'] === 'true'
    if (isLogin === isTryingToGetHome || (!isTryingToGetRegister && !isTryingToGetHome))
        next()
    else if (isLogin && !isTryingToGetHome) {
        cookiesHandler.createErrorCookie(req,res,constants.CANT_GET_LOGIN_PAGE_ERROR)
        isFetch? res.status(302).json({redirect: "/home"}):res.redirect("/home")
    }
    else{
        cookiesHandler.createErrorCookie(req,res,constants.NOT_LOGIN_ERROR)
        isFetch? res.status(302).json({redirect: "/"}):res.redirect("/")
        //res.redirect('/')
    }
})


module.exports = router;