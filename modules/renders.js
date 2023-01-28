const USER_PARAMS_INDEX = {"email":0, "fName":1, "lName":2};

const renderResponseModule = (function(){
    const renderRegisterPage = (req, res, errMsg)=>{
        res.render('register',{
            tabTitle: "Register",
            pageTitle: "Please register",
            subTitle: "Register",
            error: errMsg,
            email:req.data.userDataParams[USER_PARAMS_INDEX.email],
            fName:req.data.userDataParams[USER_PARAMS_INDEX.fName],
            lName: req.data.userDataParams[USER_PARAMS_INDEX.lName]
        })
    }

    const renderPasswordPage = (res, errMsg)=>{
        res.render('register-password', {
            tabTitle: "Password",
            pageTitle: "Please choose a password",
            subTitle: "Register",
            error: errMsg
        })
    }

    const renderLoginPage = (req, res)=>{
        res.render('login',{
            tabTitle: "Login",
            pageTitle: "Please sign in",
            subTitle: "Exercise 6 (part 1: registration)",
            error: req.data.error
        })
    }
    const getHome = (req, res)=>{
        res.render('home',{
            tabTitle: "Home",
            username: req.session.username,
            token: req.session.userid.toString(),
            error: req.data.error
        })
    }

    return {
        "renderRegisterPage": renderRegisterPage,
        "renderPasswordPage":renderPasswordPage,
        "renderLoginPage":renderLoginPage,
        "getHome": getHome
    }
})();

module.exports = renderResponseModule