const Cookies = require("cookies");

/**
 * This module is handle with cookies.
 * @type {{ERROR_COOKIE_NAME: string, REGISTER_SUCCESS: string, EXPIRED_USER_COOKIE: string, clearUserDataCookie: clearUserDataCookie, USER_DATA_KEYS: string[], createErrorCookie: createErrorCookie, createUserDataCookie: createUserDataCookie}}
 */
module.exports = (function(){
    const ERROR_COOKIE_NAME = 'ErrorCookie'
    const REGISTER_SUCCESS = "Registration successful, you can now login"
    const USER_DATA_KEYS = ['email', 'fName','lName']
    const EXPIRED_USER_COOKIE = "Registration process expired, please start again"
    const MAX_COOKIE_AGE_IN_MS = 30000

    function createErrorCookie(req, res, errorMessage){
        let cookies = new Cookies(req,res);
        cookies.set(ERROR_COOKIE_NAME,errorMessage,{maxAge:Number.MAX_SAFE_INTEGER})
    }

    function handleUserDataCookie(req, res,email="",fName="",lName="", maxAge=0){
        let cookies = new Cookies(req,res,{keys:USER_DATA_KEYS})
        cookies.set('email', email, {maxAge: maxAge ,signed: true})
        cookies.set ('fName', fName, {maxAge: maxAge ,signed: true})
        cookies.set ('lName', lName, {maxAge: maxAge ,signed: true})

    }

    function clearUserDataCookie(req, res){
        handleUserDataCookie(req, res)
    }

    function createUserDataCookie(req, res, email, fName, lName){
        handleUserDataCookie(req,res,email,fName,lName,MAX_COOKIE_AGE_IN_MS)
    }


    return {
        ERROR_COOKIE_NAME,
        REGISTER_SUCCESS,
        USER_DATA_KEYS,
        EXPIRED_USER_COOKIE,
        createErrorCookie,
        createUserDataCookie,
        clearUserDataCookie
    }
})();