const cookiesHandler = require("../modules/cookiesHandler.js");
const Cookies = require('cookies');
const db = require('../models');
const dbHandler = require("../modules/userDbHandlerModule.js")
const utilities = require("../modules/utilities.js")
const USER_PARAMS_INDEX = {"email":0, "fName":1, "lName":2};

/**
 * Route that let us see users table. It's for private use, not part of the recommendations.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.getDb = (req, res) =>{
    return db.User.findAll()
        .then((contacts) => res.send(contacts))
        .catch((err) => {
            console.log('There was an error querying users', JSON.stringify(err))
            err.error = 1; // some error code for client side
            return res.send(err)
        });
};

/**
 * This router is extract user's data from the cookie into req.data.
 * It created two keys and values: 1. key: userDataParams value: user's data, 2. isAllUserDataExist : boolean
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
    req.data.isAllUserDataExist = params.every((val)=>!!val)
    req.data.isOverFirstStep = cookies.get("isOverFirstStep")
    next()
}

/**
 * This route is showing the login page and showing the error message if it exists.
 * @param req
 * @param res
 */
exports.getLoginPage = (req, res) =>{

    res.render('login',{
        tabTitle: "Login",
        pageTitle: "Please sign in",
        subTitle: "Exercise 6 (part 1: registration)",
        error: req.data.error,
    })
}


exports.postLogin = async (req, res)=>{

    try{
        const loginUser = db.User.build({
            email: utilities.trimAndLower(req.body.email),
            password: utilities.trimAndLower(req.body.password)
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

    res.render('register',{
        tabTitle: "Register",
        pageTitle: "Please register",
        subTitle: "Register",
        error: req.data.error,
        email:req.data.userDataParams[USER_PARAMS_INDEX.email],
        fName:req.data.userDataParams[USER_PARAMS_INDEX.fName],
        lName: req.data.userDataParams[USER_PARAMS_INDEX.lName]
    })
    //renderRegisterPage(req,res, req.data.error)
}

/**
 * This route is handle with sending the first register page.
 * It checks if all fields are valid. If they are, they inserted inside a cookie.
 * If they are not, the client will see an error.
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
 * This route is getting the password page. It checks first if it's valid for client to enter it, if it isn't, user
 * redirect to register page.
 * @param req
 * @param res
 */
exports.getPassword = (req,res)=>{
    if (!req.data.isAllUserDataExist || !req.data.isOverFirstStep){
        cookiesHandler.createErrorCookie(req,res, cookiesHandler.INVALID_ACCESS)
        res.redirect('/users/register')
    }
    else {
        res.render('register-password', {
            tabTitle: "Password",
            pageTitle: "Please choose a password",
            subTitle: "Register",
            error: req.data.error
        })
        //renderPasswordPage(res, req.data.error)
    }


}
/**
 * This route is handle with sending the password form. It checks first if there is a cookie with user's details.
 * If they aren't, user will go back to first register page with an error message.
 * If they are, the server check if there is an error with password/ details (email exist, password invalid...).
 * If they aren't, user will go to another page (if the password is invalid - to current page with an error message,
 * otherwise - to register page). If everything okay, user will redirect to home page with message that says the
 * registration finished successfully.
 *
 * @param req
 * @param res
 */
exports.postPassword = async (req,res)=>{

    if (!req.data.isAllUserDataExist){
        cookiesHandler.createErrorCookie(req,res, cookiesHandler.EXPIRED_USER_COOKIE)
        res.redirect('/users/register')
    }

    else if (!req.data.isOverFirstStep){
        cookiesHandler.createErrorCookie(req,res, cookiesHandler.INVALID_ACCESS)
        res.redirect('/users/register')
    }

    else {
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

}



