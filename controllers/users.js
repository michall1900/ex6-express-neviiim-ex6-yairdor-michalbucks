const User = require("../models/user.js")


exports.getLoginPage = (req, res, next) =>{
    res.render('login',{
        tabTitle: "login",
        pageTitle: "Please sign in",
        path:'/'
    })
}


exports.getFirstRegisterUser = (req, res,next)=>{
    //to do - check cookie and insert into the object if the cookie exist.

    res.render('register',{
        tabTitle: "register",
        pageTitle: "Please register",
        path:'/users/register'
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
            tabTitle: "register",
            pageTitle: "Please register",
            path:'/users/register',
            error:err.message,
            formData: req.body
        })
    }


}

exports.getPassword = (req,res, next)=>{
    // to do- check if cookie still exist. If it isn't - back to login + error message.

    //cookie exist
    res.render('register-password',{
        tabTitle: "password",
        pageTitle: "Please choose a password"
    })

}

exports.postPassword = (req,res, next)=>{

    //to do - same as before but here we need to return to register + error message (if cookie isn't exist).

    //cookie exist, take it's parameter into User's constructor.
    let user = new User()
    try{
        user.save()

    }

    // It's not a nice solution, but it will work.
    catch (err){
        if (err.message === user.INVALID_PASSWORD_ERR){
            res.render ('register-password',{
                tabTitle: "password",
                pageTitle: "Please choose a password",
                error: err.message
            })
        }
        else{
            res.redirect('register',{
                tabTitle: "register",
                pageTitle: "Please register",
                path:'/users/register',
                error:err.message
            })
        }

    }
}



