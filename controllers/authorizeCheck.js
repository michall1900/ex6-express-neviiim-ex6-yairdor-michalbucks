const userCouldntGetPage = require("../modules/utilities.js").userCouldntGetPage;
const constants = require("../modules/constantsErrorMessageModule.js");

exports.getAuthorizeCheck = (req,res,next)=>{
    const isLogin = !!(req.session.isLogin)
    const isTryingToGetHome = req.url.startsWith("/home")
    const isTryingToGetRegister = req.url === ("/") || req.url.startsWith("/users/register")
    const isFetch = req.headers && req.headers['x-is-fetch'] === 'true'
    const currentToken = (!!req.session.userId)? req.session.userId.toString():""
    const isTokensSame = req.headers && req.headers['token'] === currentToken

    if ((isLogin && isTryingToGetHome && (isTokensSame || !isFetch))|| (!isLogin && !isTryingToGetHome )||
        (!isTryingToGetRegister && !isTryingToGetHome))
        next()
    else if(isLogin && req.url === ("/"))
        userCouldntGetPage(req,res,undefined,"/home",isFetch)
    else if(isTryingToGetHome && isLogin && !isTokensSame)
        userCouldntGetPage(req,res, constants.LOGIN_TO_ANOTHER_USER, "/home",isFetch)
    else if (isLogin && !isTryingToGetHome)
        userCouldntGetPage(req,res, constants.CANT_GET_LOGIN_PAGE_ERROR, "/home",isFetch)
    else
        userCouldntGetPage(req,res, constants.NOT_LOGIN_ERROR, "/",isFetch)
}