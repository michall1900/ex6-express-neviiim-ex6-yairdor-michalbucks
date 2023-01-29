const validation = require("./validationModule.js")
const session = require("express-session");
const cookiesHandler = require("./cookiesHandler");
const constants = require("./constantsErrorMessageModule");

const utilitiesModule = (function(){

    /**
     * The function is doing trim() and to lower case to the received string.
     * @param string
     * @returns {string|*}
     */
    const trimAndLower = (string)=>{
        return (validation.isString(string))? string.trim().toLowerCase(): string
    }
    /**
     * This function is making a string look like a title if it is a string (capitalize every first letter in all words).
     * @param string
     * @returns {string|*}
     */
    const stringToTitle = (string) =>{
        return (validation.isString(string))? string.split(" ").map((str)=>str.charAt(0).toUpperCase() +str.slice(1)).reverse().join(" ") : string
    }
    /**
     * This function is building a session
     * @returns {(function(*, *, *): (undefined|*))|*}
     */
    const buildSession = ()=>{
        return session({
            secret:"somesecretkey",
            resave: false, // Force save of session for each request
            saveUninitialized: false, // Save a session that is new, but has not been modified
            cookie: {maxAge: Number.MAX_SAFE_INTEGER }
        })
    }

    /**
     * This function is sets error message if needed and redirect client.
     * @param req
     * @param res
     * @param errorMsg - wanted error message to display.
     * @param redirectAdd - redirecting to the wanted address.
     * @param isFetch
     */
    const userCouldntGetPage =(req,res, errorMsg, redirectAdd,isFetch)=>{
        if (errorMsg)
            cookiesHandler.createErrorCookie(req,res, `${errorMsg} ${constants.WRONG_ADDRESS}`)
        isFetch? res.status(302).json({redirect:redirectAdd}):res.redirect(redirectAdd)
    }

    /**
     * Checks if user could get into password page.
     * @param req
     * @param res
     * @returns {boolean}
     */
    const isValidGettingPasswordPage = (req,res) =>{
        if (!req.data.isAllUserDataExist){
            cookiesHandler.createErrorCookie(req,res, cookiesHandler.EXPIRED_USER_COOKIE)
            return false
        }
        if (!req.data.isOverFirstStep){
            cookiesHandler.createErrorCookie(req,res, cookiesHandler.INVALID_ACCESS)
            return false
        }
        return true
    }

    return {trimAndLower, stringToTitle, buildSession, userCouldntGetPage,isValidGettingPasswordPage}
})();

module.exports = utilitiesModule