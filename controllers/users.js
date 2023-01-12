const User = require("../modules/user.js")
const validation = require("../modules/validationModule.js")
const cookiesHandler = require("../modules/cookiesHandler.js")
const Cookies = require('cookies')

const USER_PARAMS_INDEX = {"email":0, "fName":1, "lName":2};

/**
 * The function is doing trim() and to lower case to the received string.
 * @param string
 * @returns {string|*}
 */
function trimAndLower(string){
    if (validation.isString(string))
        return string.trim().toLowerCase()
    return string
}

// function renderPasswordPage(res, errMsg){
//     res.render('register-password', {
//         tabTitle: "Password",
//         pageTitle: "Please choose a password",
//         subTitle: "Register",
//         error: errMsg
//     })
// }
//
// function renderRegisterPage(req, res, errMsg){
//     res.render('register',{
//         tabTitle: "Register",
//         pageTitle: "Please register",
//         subTitle: "Register",
//         error: errMsg,
//         email:req.data.userDataParams[USER_PARAMS_INDEX.email],
//         fName:req.data.userDataParams[USER_PARAMS_INDEX.fName],
//         lName: req.data.userDataParams[USER_PARAMS_INDEX.lName]
//     })
// }

/**
 * This router is extract user's data from the cookie into req.data.
 * It created two keys and values: 1. key: userDataParams value: user's data, 2. isUserDataCookieExist : boolean
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
    req.data.isUserDataCookieExist = params.every((val)=>!!val)
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
exports.postFirstRegisterPage = (req,res)=>{
    let params = [req.body.email, req.body.fName, req.body.lName]
    let paramsAfterTrim = params.map((string)=> trimAndLower(string))
    let user = new User(...paramsAfterTrim)

    try{
        cookiesHandler.createUserDataCookie(req,res,...params)
        user.validateAttributes()
        res.redirect("/users/register-password")
    }
    catch (err){
        cookiesHandler.createErrorCookie(req, res, err.message)
        res.redirect('/users/register')
        //renderRegisterPage(req, res, err.message)
    }


}
/**
 * This route is getting the password page. It checks first if it's valid for client to enter it, if it isn't, user
 * redirect to register page.
 * @param req
 * @param res
 */
exports.getPassword = (req,res)=>{

    if (!req.data.isUserDataCookieExist){
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
exports.postPassword = (req,res)=>{

    if (!req.data.isUserDataCookieExist){
        cookiesHandler.createErrorCookie(req,res, cookiesHandler.EXPIRED_USER_COOKIE)
        res.redirect('/users/register')
    }
    else {
        let params = (req.data.userDataParams).map((string) => trimAndLower(string))
        let user = new User(...params, req.body.password1, req.body.password2)

        try {
                user.save()
                cookiesHandler.createErrorCookie(req, res, cookiesHandler.REGISTER_SUCCESS)
                cookiesHandler.clearUserDataCookie(req, res)
                res.redirect('/')
        }
        catch (err) {
            cookiesHandler.createErrorCookie(req, res, err.message)
            if (err.message === user.INVALID_PASSWORD_ERR)
                res.redirect('/users/register-password')
                //renderPasswordPage(res,err.message)
            else {
                //cookiesHandler.createErrorCookie(req, res, err.message)
                res.redirect('/users/register')
            }
        }
    }
}



