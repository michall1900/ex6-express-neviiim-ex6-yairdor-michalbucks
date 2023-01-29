const Cookies = require("cookies");

/**
 * This module is handle with cookies.
 * @type {{ERROR_COOKIE_NAME: string, REGISTER_SUCCESS: string, EXPIRED_USER_COOKIE: string, clearUserDataCookie: clearUserDataCookie, USER_DATA_KEYS: string[], createErrorCookie: createErrorCookie, createUserDataCookie: createUserDataCookie}}
 */
const cookiesHandlerModule = (function(){
    const ERROR_COOKIE_NAME = 'ErrorCookie'
    const REGISTER_SUCCESS = "Registration successful, you can now login"
    const USER_DATA_KEYS = ['email', 'fName','lName']
    const EXPIRED_USER_COOKIE = "Registration process expired, please start again"
    const INVALID_ACCESS = "You should complete first this page."
    const MAX_COOKIE_AGE_IN_MS = 30000

    /**
     * This function is creating the error cookie. It sets the error message inside the cookie.
     * @param req
     * @param res
     * @param errorMessage - The wanted error to display.
     */
    function createErrorCookie(req, res, errorMessage){
        let cookies = new Cookies(req,res);
        cookies.set(ERROR_COOKIE_NAME,errorMessage,{maxAge:Number.MAX_SAFE_INTEGER})
    }

    /**
     * This function is handle with user's data cookies. The function creating/ deleting the cookie.
     * @param req
     * @param res
     * @param email - user's email address.
     * @param fName - user's first name
     * @param lName - user's last name
     * @param maxAge - cookie lifetime
     * @param isOverFirstStep - tells if the first registration was valid or not.
     */
    function handleUserDataCookie(req, res,email="",fName="",lName="",isOverFirstStep=false,
                                  maxAge=0){
        let cookies = new Cookies(req,res,{keys:USER_DATA_KEYS})
        cookies.set('email', email, {maxAge: maxAge ,signed: true})
        cookies.set ('fName', fName, {maxAge: maxAge ,signed: true})
        cookies.set ('lName', lName, {maxAge: maxAge ,signed: true})
        cookies.set ('isOverFirstStep', isOverFirstStep, {maxAge: maxAge ,signed: true})
    }

    /**
     * This function is handle with deleting the user's data cookie.
     * @param req
     * @param res
     */
    function clearUserDataCookie(req, res){
        handleUserDataCookie(req, res)
    }

    /**
     * This function is handle with creating user's cookie
     * @param req
     * @param res
     * @param email - user's email address.
     * @param fName - user's first name
     * @param lName - user's last name
     * @param isOverFirstStep - tells if the first registration was valid or not.
     */
    function createUserDataCookie(req, res, email, fName, lName, isOverFirstStep){
        handleUserDataCookie(req,res,email,fName,lName,isOverFirstStep,MAX_COOKIE_AGE_IN_MS)
    }


    return {
        ERROR_COOKIE_NAME,
        REGISTER_SUCCESS,
        USER_DATA_KEYS,
        EXPIRED_USER_COOKIE,
        INVALID_ACCESS,
        createErrorCookie,
        createUserDataCookie,
        clearUserDataCookie
    }
})();

module.exports = cookiesHandlerModule