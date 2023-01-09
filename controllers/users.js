const User = require("../models/user.js")

// Note: I have many duplicated code here, I think we should search for a way to fix it.
// It's appeared in res.render commands.

exports.getLoginPage = (req, res, next) =>{
    res.render('login',{
        tabTitle: "Login",
        pageTitle: "Please sign in",
        subTitle: "Exercise 6 (part 1: registration)",
        path:'/',
        hasError: false
    })
}


exports.getFirstRegisterUser = (req, res,next)=>{
    //to do - check cookie and insert into the object if the cookie exist.

    res.render('register',{
        tabTitle: "Register",
        pageTitle: "Please register",
        subTitle: "Register",
        path:'/users/register',
        hasError: false
    })
}

exports.postFirstRegisterUser = (req,res, next)=>{
    //There is a duplicated code here, need to be changed.
    let user = new User(req.body.emailAdd.trim().toLowerCase(), req.body.fName.trim().toLowerCase(),
        req.body.lName.trim().toLowerCase())
    try{
        user.validateAttributes()
        //to do- create cookie
        res.redirect("/users/register-password")
    }
    // This is duplicate from the code before.
    catch (err){
        res.render('register',{
            tabTitle: "Register",
            pageTitle: "Please register",
            path:'/users/register',
            subTitle: "Register",
            error:err.message,
            formData: req.body,
            hasError: true
        })
    }


}

exports.getPassword = (req,res, next)=>{
    // to do- check if cookie still exist. If it isn't - back to login + error message.

    //cookie exist
    res.render('register-password',{
        tabTitle: "Password",
        pageTitle: "Please choose a password",
        subTitle: "Register",
        hasError: false
    })

}

exports.postPassword = (req,res, next)=>{

    //to do - same as before but here we need to return to register + error message (if cookie isn't exist).

    //cookie exist, take it's parameter into User's constructor. + password
    let user = new User()
    try{
        user.save()
        res.render('login',{
            tabTitle: "Login",
            pageTitle: "Please sign in",
            subTitle: "Exercise 6 (part 1: registration)",
            path:'/',
            error: "Registration successful, you can now login",
            hasError: true
        })

    }

    // It's not a nice solution, but it will work.
    catch (err){
        if (err.message === user.INVALID_PASSWORD_ERR){
            res.render ('register-password',{
                tabTitle: "Password",
                pageTitle: "Please choose a password",
                subTitle: "Register",
                error: err.message
            })
        }
        else{
            res.render('register',{
                tabTitle: "register",
                pageTitle: "Please register",
                subTitle: "Register",
                path:'/users/register',
                error:err.message,
                hasError: true
            })
        }

    }
}



