const Cookies = require("cookies");
module.exports = (function(){
    const ERROR_COOKIE_NAME = 'ErrorCookie'
    const REGISTER_SUCCESS = "Registration successful, you can now login"
    const USER_DATA_KEYS = ['email', 'fName','lName']
    const MAX_COOKIE_AGE_IN_MS = 30000

    function createErrorCookie(req, res, errorMessage){
        let cookies = new Cookies(req,res);
        cookies.set(ERROR_COOKIE_NAME,errorMessage,{maxAge:MAX_COOKIE_AGE_IN_MS})
    }

    function createUserDataCookie(req, res,email,fName,lName){
        let cookies = new Cookies(req,res,{keys:USER_DATA_KEYS})
        cookies.set('email', email, {maxAge: MAX_COOKIE_AGE_IN_MS})
        cookies.set ('fName', fName, {maxAge: MAX_COOKIE_AGE_IN_MS})
        cookies.set ('lName', lName, {maxAge: MAX_COOKIE_AGE_IN_MS})

    }

    // function clearUserDataCookie(){
    //     createErrorCookie()
    // }
    return {
        ERROR_COOKIE_NAME,
        REGISTER_SUCCESS,
        USER_DATA_KEYS,
        createErrorCookie,
        createUserDataCookie
    }
})();