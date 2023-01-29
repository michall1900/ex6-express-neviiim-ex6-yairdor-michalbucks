const cookiesHandler = require("../modules/cookiesHandler.js");
const Cookies = require('cookies');
const db = require('../models');
const dbHandler = require("../modules/userDbHandlerModule.js")
const utilities = require("../modules/utilities.js")
const renders = require("../modules/renders.js")
const USER_PARAMS_INDEX = {"email":0, "fName":1, "lName":2};


/**
 * This router is extract user's data from the cookie into req.data.
 * It created three keys and values: 1. key: userDataParams value: user's data, 2. isAllUserDataExist : boolean
 * 3. isOverFirstStep - checks if user finished the first registration step
 * that says if the cookie is exists.
 * @param req
 * @param res
 * @param next
 */
exports.getUserDataFromCookie = (req,res,next) =>{
    let cookies = new Cookies(req,res);
    let params = []
    cookiesHandler.USER_DATA_KEYS.forEach((key,index)=>{params[index] = cookies.get(key)})
    req.data.userDataParams = params
    req.data.isAllUserDataExist = params.length === cookiesHandler.USER_DATA_KEYS.length && params.every((val)=>!!val)
    req.data.isOverFirstStep = cookies.get("isOverFirstStep")
    next()
}

/**
 * This route is showing the login page and showing the error message if it exists.
 * @param req
 * @param res
 */
exports.getLoginPage = (req, res) =>{
    renders.renderLoginPage(req,res)
}

/**
 * This route is checking if user login date is exist and valid or not. If it isn't, it sends user back to login page
 * with an error. If all data ok, it sets session data and redirect user to home page.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.postLogin = async (req, res)=>{

    try{
        const loginUser = db.User.build({
            email: utilities.trimAndLower(req.body.email),
            password: req.body.password
        })
        await dbHandler.validateUser(loginUser,["email","password"])
        const user =  await dbHandler.isUserRegisterCheck(loginUser)
        req.session.isLogin = true
        req.session.username = `${user.fName} ${user.lName}`
        req.session.userId = user.id
        res.redirect("/home")
    }
    catch (err){
        dbHandler.errorHandler(req,res,err)
        res.redirect("/")
    }


}

/**
 * This route return the first register page to user.
 * @param req
 * @param res
 */
exports.getFirstRegisterPage = (req, res)=>{
    renders.renderRegisterPage(req,res)
}

/**
 * This route is handle with sending the first register page.
 * It checks if all fields are valid. If they are, client redirect to password form.
 * If they are not, the client will see an error.
 * In both cases, user data saves inside a cookie.
 * @param req
 * @param res
 */
exports.postFirstRegisterPage = async (req,res)=>{

    try {
        const newUser = db.User.build({
            email: utilities.trimAndLower(req.body.email),
            lName: utilities.trimAndLower(req.body.lName),
            fName: utilities.trimAndLower(req.body.fName)
        })
        await dbHandler.validateUser(newUser,['email', 'lName', 'fName'])
        await dbHandler.isEmailNotExistCheck(newUser.email)
        cookiesHandler.createUserDataCookie(req,res,req.body.email, req.body.fName, req.body.lName, true)
        res.redirect("/users/register-password")
    }
    catch (err){
        dbHandler.errorHandler(req,res,err)
        cookiesHandler.createUserDataCookie(req,res,req.body.email, req.body.fName, req.body.lName, false)
        res.redirect('/users/register')
    }

}
/**
 * This route is checks first if it's valid for client to enter password registration page, if it isn't, user
 * redirect to register page.
 * @param req
 * @param res
 * @param next
 */
exports.validFirstRegistrationRoute = (req,res, next)=>{
    if (utilities.isValidGettingPasswordPage(req,res))
        next()
    else
        res.redirect('/users/register')
}
/**
 * This route is getting the password page.
 * @param req
 * @param res
 */
exports.getPassword = (req,res)=>{
    renders.renderPasswordPage(req,res)


}
/**
 * This route is handle with sending the password form.
 * The server check if there is an error with password/ details (email exist, password invalid...).
 * If they aren't, user will go to another page (if the password is invalid - to current page with an error message,
 * otherwise - to register page). If everything okay, user will redirect to home page with message that says the
 * registration finished successfully.
 *
 * @param req
 * @param res
 */
exports.postPassword = async (req,res)=>{

    try {
        await db.User.create({
            email: utilities.trimAndLower(req.data.userDataParams[USER_PARAMS_INDEX.email]),
            lName: utilities.trimAndLower(req.data.userDataParams[USER_PARAMS_INDEX.lName]),
            fName: utilities.trimAndLower(req.data.userDataParams[USER_PARAMS_INDEX.fName]),
            password: req.body.password1,
            passwordConfirm: req.body.password2
        })
        cookiesHandler.createErrorCookie(req, res, cookiesHandler.REGISTER_SUCCESS)
        cookiesHandler.clearUserDataCookie(req, res)
        res.redirect("/")
    } catch (err) {
        dbHandler.errorHandler(req, res, err)
        if (err.message && err.message.includes("password"))
            res.redirect('/users/register-password')
        else
            res.redirect('/users/register')
    }


}



