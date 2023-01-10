const User = require("../modules/user.js")
const validation = require("../modules/validationModule.js")
const cookiesHandler = require("../modules/cookiesHandler.js")
const Cookies = require('cookies')

function trimAndLower(string){
    if (validation.isString(string))
        return string.trim().toLowerCase()
    return string
}


exports.getLoginPage = (req, res, next) =>{

    res.render('login',{
        tabTitle: "Login",
        pageTitle: "Please sign in",
        subTitle: "Exercise 6 (part 1: registration)",
        error: req.data,
    })
}


exports.getFirstRegisterUser = (req, res,next)=>{
    let cookies = new Cookies(req,res);
    let values = {}
    cookiesHandler.USER_DATA_KEYS.forEach((key)=>{values[key] = cookies.get(key)})
    res.render('register',{
        tabTitle: "Register",
        pageTitle: "Please register",
        subTitle: "Register",
        error: req.data,
        email:values.email,
        fName:values.fName,
        lName: values.lName
    })
}

exports.postFirstRegisterUser = (req,res)=>{
    let params = [req.body.emailAdd, req.body.fName, req.body.lName]
    params = params.map((string)=> trimAndLower(string))
    let user = new User(...params)

    try{
        user.validateAttributes()
        cookiesHandler.createUserDataCookie(req,res,...params)
        res.redirect("/users/register-password")
    }
    catch (err){
        cookiesHandler.createErrorCookie(req, res, err.message)
        res.redirect('/users/register')
    }


}

exports.getPassword = (req,res)=>{
    // to do- check if cookie still exist. If it isn't - back to login + error message.
    let cookies = new Cookies(req,res);
    let values = {}
    cookiesHandler.USER_DATA_KEYS.forEach((key)=>{values[key] = cookies.get(key)})
    if (![...Object.values(values)].every((val)=>!!val)){
        // createErrorCookie(res,req,"You can't enter a password before you entered other data." +
        //     "Please fill your details")
        res.redirect('/users/register')
    }
    else {
        res.render('register-password', {
            tabTitle: "Password",
            pageTitle: "Please choose a password",
            subTitle: "Register",
            error: req.data
        })
    }


}

exports.postPassword = (req,res)=>{

    let cookies = new Cookies(req,res);
    let params = []
    cookiesHandler.USER_DATA_KEYS.forEach((key,index)=>{params[index] = cookies.get(key)})
    if (!params.every((val)=>!!val)){
        cookiesHandler.createErrorCookie(req,res,"Registration process expired, please start again")
        res.redirect('/users/register')
    }
    params = params.map((string)=> trimAndLower(string))
    let user = new User(...params, req.body.password1, req.body.password2)

    try{
        user.save()
        cookiesHandler.createErrorCookie(req,res,cookiesHandler.REGISTER_SUCCESS)
        //clear all cookie's fields.
        res.redirect('/')
    }

    catch (err){
        cookiesHandler.createErrorCookie(req,res,err.message)
        if (err.message === user.INVALID_PASSWORD_ERR)
            res.redirect('/users/register-password')
        else{
            res.redirect('/users/register')
        }

    }
}



