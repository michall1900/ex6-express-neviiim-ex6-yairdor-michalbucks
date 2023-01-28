// const userCouldntGetPage = require("../modules/utilities.js").userCouldntGetPage;
// const constants = require("../modules/constantsErrorMessageModule.js");
//
// exports.getAuthorizeCheck = (req,res,next)=>{
//     const isLogin = !!(req.session.isLogin)
//     req.session.isGotHomePage = isLogin && req.session.isGotHomePage
//     const isTryingToGetHome = req.url.startsWith("/home")
//     const isTryingToGetRegister = req.url === ("/") || req.url.startsWith("/users/register")
//     const isFetch = req.headers && req.headers['x-is-fetch'] === 'true'
//     const currentToken = (!!req.session.userId)? req.session.userId.toString():undefined
//     const isToken = req.headers && !!req.headers['token'] && req.headers['token'].length
//     const isTokensSame = currentToken && isToken && req.headers['token'] === currentToken
//     console.log(isToken)
//     if ((isLogin && isTryingToGetHome && (isTokensSame || !req.session.isGotHomePage && !isFetch))||
//         (!isLogin && !isTryingToGetHome )||
//         (!isTryingToGetRegister && !isTryingToGetHome)) {
//         if (isLogin && !req.session.isGotHomePage)
//             req.session.isGotHomePage = true
//         next()
//     }
//     else if(isLogin && req.url === ("/"))
//         userCouldntGetPage(req,res,undefined,"/home",isFetch)
//     else if(isTryingToGetHome && isLogin && isToken && !isTokensSame && req.session.isGotHomePage)
//         userCouldntGetPage(req,res, constants.LOGIN_TO_ANOTHER_USER, "/home",isFetch)
//     else if (isLogin && !isTryingToGetHome && isTokensSame && req.session.isGotHomePage)
//         userCouldntGetPage(req,res, constants.CANT_GET_LOGIN_PAGE_ERROR, "/home",isFetch)
//     else if (!isLogin  && isTryingToGetHome)
//         userCouldntGetPage(req,res, constants.NOT_LOGIN_ERROR, "/",isFetch)
//     else if (isLogin && (!isToken || !isTokensSame) && isTryingToGetHome) {
//         req.session.isGotHomePage = false
//         res.status(300).send(constants.INVALID_TOKEN)
//     }
//     else{
//         next()
//     }
//
// }
const userCouldntGetPage = require("../modules/utilities.js").userCouldntGetPage;
const constants = require("../modules/constantsErrorMessageModule.js");

exports.getAuthorizeCheck = (req,res,next)=>{
    const isLogin = !!(req.session.isLogin)
    const isTryingToGetHome = req.url.startsWith("/home")
    const isTryingToGetRegister = req.url === ("/") || req.url.startsWith("/users/register")
    const isFetch = req.headers && req.headers['x-is-fetch'] === 'true'
    const currentToken = (!!req.session.userId)? req.session.userId.toString():""
    const isHasToken = req.headers && req.headers['token'] && !!req.headers['token'].length
    const isTokensSame = isHasToken && req.headers['token'] === currentToken

    //the problem here is when user have no token..
    // if ((isLogin && isTryingToGetHome && (isTokensSame || !isFetch))|| (!isLogin && !isTryingToGetHome )||
    //     (!isTryingToGetRegister && !isTryingToGetHome))
    //     next()
    // else if(isLogin && req.url === ("/"))
    //     userCouldntGetPage(req,res,undefined,"/home",isFetch)
    // else if(isTryingToGetHome && isLogin && !isTokensSame)
    //     userCouldntGetPage(req,res, constants.LOGIN_TO_ANOTHER_USER, "/home",isFetch)
    // else if (isLogin && !isTryingToGetHome)
    //     userCouldntGetPage(req,res, constants.CANT_GET_LOGIN_PAGE_ERROR, "/home",isFetch)
    // else
    //     userCouldntGetPage(req,res, constants.NOT_LOGIN_ERROR, "/",isFetch)

    if ((isLogin && isTryingToGetHome && (isTokensSame || !isFetch))|| (!isLogin && isTryingToGetRegister )||
        (!isTryingToGetRegister && !isTryingToGetHome))
        next()
    else if(isLogin && req.url === ("/"))
        userCouldntGetPage(req,res,undefined,"/home",isFetch)
    else if(isTryingToGetHome && isLogin && isHasToken && !isTokensSame)
        userCouldntGetPage(req,res, constants.LOGIN_TO_ANOTHER_USER, "/home",isFetch)
    else if (isLogin && !isTryingToGetHome)
        userCouldntGetPage(req,res, constants.CANT_GET_LOGIN_PAGE_ERROR, "/home",isFetch)
    else if (!isLogin && isTryingToGetHome)
        userCouldntGetPage(req,res, constants.NOT_LOGIN_ERROR, "/",isFetch)
    else
        res.status(300).send(constants.INVALID_TOKEN)

    // req.session.isGotHomePage = isLogin && req.session.isGotHomePage
    // if (isLogin) {
    //     if (req.url === ("/"))
    //         userCouldntGetPage(req, res, undefined, "/home", isFetch)
    //     else if (isTryingToGetRegister) {
    //         userCouldntGetPage(req, res, constants.CANT_GET_LOGIN_PAGE_ERROR, "/home", isFetch)
    //     }
    //     else if (isTryingToGetHome) {
    //         if (isTokensSame)
    //             next()
    //         else {
    //             if (isHasToken) {
    //                 if (!req.session.isTriedToRefresh) {
    //                     req.session.isTriedToRefresh = true
    //                     userCouldntGetPage(req, res, constants.LOGIN_TO_ANOTHER_USER, "/home", isFetch)
    //                 } else {
    //                     res.status(300).send(constants.INVALID_TOKEN)
    //                 }
    //             }
    //             else {
    //                 if (req.url === "/home") {
    //                     if (!isFetch) {
    //                         next()
    //                     } else {
    //                         res.status(300).send(constants.INVALID_TOKEN)
    //                     }
    //                 }
    //                 else{
    //                     if (!req.session.isTriedToRefresh) {
    //                         req.session.isTriedToRefresh = true
    //                         userCouldntGetPage(req, res, constants.LOGIN_TO_ANOTHER_USER, "/home", isFetch)
    //                     } else {
    //                         res.status(300).send(constants.INVALID_TOKEN)
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     else
    //         next()
    // }
    // else {
    //     if (isTryingToGetHome) {
    //         userCouldntGetPage(req, res, constants.NOT_LOGIN_ERROR, "/", isFetch)
    //     }
    //     else {
    //         next()
    //     }
    // }
}