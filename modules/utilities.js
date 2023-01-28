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

    const stringToTitle = (string) =>{
        let convertedStr = (validation.isString(string))? string.split(" ").map((str)=>str.charAt(0).toUpperCase() +str.slice(1)).reverse().join(" ") : string
        console.log(convertedStr)
        return convertedStr
    }

    const buildSession = ()=>{
        console.log("here")
        return session({
            secret:"somesecretkey",
            resave: false, // Force save of session for each request
            saveUninitialized: false, // Save a session that is new, but has not been modified
            cookie: {maxAge: Number.MAX_SAFE_INTEGER }
        })
    }

    const userCouldntGetPage =(req,res, errorMsg, redirectAdd,isFetch)=>{
        if (errorMsg)
            cookiesHandler.createErrorCookie(req,res,errorMsg)
        isFetch? res.status(302).json({redirect:redirectAdd}):res.redirect(redirectAdd)
    }

    return {trimAndLower, stringToTitle, buildSession, userCouldntGetPage}
})();

module.exports = utilitiesModule