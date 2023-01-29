const USER_PARAMS_INDEX = {"email":0, "fName":1, "lName":2};

const renderResponseModule = (function(){
    /**
     * This function return the first register page to user.
     * @param req
     * @param res
     */
    const renderRegisterPage = (req, res)=>{
        res.render('register',{
            tabTitle: "Register",
            pageTitle: "Please register",
            subTitle: "Register",
            error: req.data.error,
            email:req.data.userDataParams[USER_PARAMS_INDEX.email],
            fName:req.data.userDataParams[USER_PARAMS_INDEX.fName],
            lName: req.data.userDataParams[USER_PARAMS_INDEX.lName]
        })
    }
    /**
     * This function is render the password registration page
     * @param req
     * @param res
     */
    const renderPasswordPage = (req, res)=>{
        res.render('register-password', {
            tabTitle: "Password",
            pageTitle: "Please choose a password",
            subTitle: "Register",
            error: req.data.error
        })
    }

    /**
     * This function is renders the login page and showing the error message if it exists.
     * @param req
     * @param res
     */
    const renderLoginPage = (req, res)=>{
        res.render('login',{
            tabTitle: "Login",
            pageTitle: "Please sign in",
            subTitle: "Exercise 6 (part 1: registration)",
            error: req.data.error
        })
    }
    /**
     * Render the home page with error if needed, username, includes also token inside the dom.
     * @param req
     * @param res
     */
    const getHome = (req, res)=>{
        console.log(req.session.userId)
        res.render('home',{
            tabTitle: "Home",
            username: req.session.username,
            token: req.session.userId.toString(),
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