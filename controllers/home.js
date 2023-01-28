//const userCouldntGetPage = require("../modules/utilities.js").userCouldntGetPage;

//const constants = require("../modules/constantsErrorMessageModule");
// exports.checkLogin = (req,res,next)=>{
//     const isFetch = req.headers && req.headers['x-is-fetch'] === 'true'
//     if (!req.session.isLogin)
//         userCouldntGetPage(req,res, constants.NOT_LOGIN_ERROR, "/",isFetch)
//     else if()
// }

exports.getHome = (req, res)=>{
    res.render('home',{
        tabTitle: "Home",
        username: req.session.username,
        token: req.session.userId.toString(),
        error: req.data.error
    })
}

exports.getLogout = (req,res) =>{
    req.session.destroy();
    (req.headers && req.headers['x-is-fetch'] === 'true')? res.send(302).json({redirect:'/'}):res.redirect("/")
}