const validation = require("../modules/validationModule.js")
const cookiesHandler = require("../modules/cookiesHandler.js")
const Cookies = require('cookies')
const db = require('../models');
const constants = require("../modules/constantsModule.js")
const Sequelize = require('sequelize');

const USER_PARAMS_INDEX = {"email":0, "fName":1, "lName":2};


exports.getDb = (req, res) =>{
    return db.User.findAll()
        .then((contacts) => res.send(contacts))
        .catch((err) => {
            console.log('There was an error querying contacts', JSON.stringify(err))
            err.error = 1; // some error code for client side
            return res.send(err)
        });
};
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

async function isEmailNotExist(email){

    const user = await db.User.findOne({where:{email: email}})
    if (user)
        throw new Error (constants.EMAIL_EXIST_ERR)

}


// function isEmailExist(req, res){
//     return
// }
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


exports.postLogin = (req, res)=>{
    //console.log(req.body)
    console.log(db.User)
    //do build first and check validation.
    return db.User.findOne({where:{email:req.body.email, password:req.body.password}})
        .then((user) => {
            console.log(`user = ${user}`)
            if (!user)
                throw "User not found."
            req.session.isLogin = true
            req.session.userName = `${user.lName} ${user.fName}`
            req.session.userId = user.id
            res.redirect("/home")
        })
        .catch((err)=>{
            console.log(`Error: ${err}`)
            if (err instanceof Sequelize.ValidationError)
                cookiesHandler.createErrorCookie(req, res, `Validation error: ${err}`)
            else
                cookiesHandler.createErrorCookie(req, res, `Oops, something went wrong: ${err}`)
            res.redirect("/")
        })
    //check req.body.email, req.body.password. It will be done with db.
    //if user in db and valid, redirect him to '/home/' + save in session that he is login.

    //here I assume that user is valid (without check it)


    //if user is not in db, render current page with error message (will be change)


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

    try{
        const user = db.User.build({
        email: trimAndLower(req.body.email),
        lName: trimAndLower(req.body.lName),
        fName: trimAndLower(req.body.fName)
        })
        await isEmailNotExist(user.email)
        user.validate({fields: ['email', 'lName', 'fName']})
            .then (() =>{
                cookiesHandler.createUserDataCookie(req,res,req.body.email, req.body.fName, req.body.lName, true)
                res.redirect("/users/register-password")
            })
            .catch((err)=>{
                cookiesHandler.createUserDataCookie(req,res,req.body.email, req.body.fName, req.body.lName, false)
                if (err instanceof Sequelize.ValidationError) {
                    let error= err.message.replace('\n',' ')
                    cookiesHandler.createErrorCookie(req, res, error)
                }
                else
                    cookiesHandler.createErrorCookie(req, res, `Oops, something went wrong: ${err}`)
                res.redirect('/users/register')
            })}
    catch (err){
        cookiesHandler.createUserDataCookie(req,res,req.body.email, req.body.fName, req.body.lName, false)
        cookiesHandler.createErrorCookie(req, res, `Oops, something went wrong... ${err.message}`)
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
    if (!req.data.isUserDataCookieExist || !req.data.isOverFirstStep){
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

    if (!req.data.isOverFirstStep){
        //will be change to another error
        cookiesHandler.createErrorCookie(req,res, cookiesHandler.EXPIRED_USER_COOKIE)
        res.redirect('/users/register')
    }
    if (!req.data.isUserDataCookieExist){
        cookiesHandler.createErrorCookie(req,res, cookiesHandler.EXPIRED_USER_COOKIE)
        res.redirect('/users/register')
    }
    else {
        //let params = (req.data.userDataParams).map((string) => trimAndLower(string))
        // let user = new User(...params, req.body.password1, req.body.password2)
        //
        //
        // try {
        //         user.save()
        //         cookiesHandler.createErrorCookie(req, res, cookiesHandler.REGISTER_SUCCESS)
        //         cookiesHandler.clearUserDataCookie(req, res)
        //         res.redirect('/')
        // }
        // catch (err) {
        //     cookiesHandler.createErrorCookie(req, res, err.message)
        //     if (err.message === user.INVALID_PASSWORD_ERR)
        //         res.redirect('/users/register-password')
        //         //renderPasswordPage(res,err.message)
        //     else {
        //         //cookiesHandler.createErrorCookie(req, res, err.message)
        //         res.redirect('/users/register')
        //     }
        // }
        try{
            const user = db.User.build({
                email: trimAndLower(req.data.userDataParams[USER_PARAMS_INDEX.email]),
                lName: trimAndLower(req.data.userDataParams[USER_PARAMS_INDEX.lName]),
                fName: trimAndLower(req.data.userDataParams[USER_PARAMS_INDEX.fName]),
                password: req.body.password1,
                confirmPassword: req.body.password2
            })
            user.save()
                .then (() =>{
                    cookiesHandler.createErrorCookie(req, res, cookiesHandler.REGISTER_SUCCESS)
                    cookiesHandler.clearUserDataCookie(req, res)
                    res.redirect("/")
                })
                .catch((err)=>{
                    console.log(err)
                    console.log(typeof err)
                    if (err instanceof Sequelize.ValidationError) {
                        let error= err.message.replace('\n',' ')
                        cookiesHandler.createErrorCookie(req, res, error)
                        if (error.includes("password"))
                            res.redirect('/users/register-password')
                    }
                    else
                        cookiesHandler.createErrorCookie(req, res, `Oops, something went wrong... ${err}`)
                    if (!res.headersSent)
                        res.redirect('/users/register')
                })}
        catch (err){
            cookiesHandler.createErrorCookie(req, res, `Oops, something went wrong...${err.message}`)
            res.redirect('/users/register-password')
        }
    }
}



