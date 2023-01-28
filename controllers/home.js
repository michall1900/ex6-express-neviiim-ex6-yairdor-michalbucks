const utilities = require("../modules/utilities.js")
exports.getHome = (req, res)=>{
    console.log(req.data.error)
    res.render('home',{
        tabTitle: "Home",
        username: req.session.username,//utilities.stringToTitle(req.session.username),
        error: req.data.error
    })
}

exports.getLogout = (req,res) =>{
    req.session.isLogin = false
    res.redirect("/")
}