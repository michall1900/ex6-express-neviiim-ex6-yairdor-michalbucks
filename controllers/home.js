
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
    res.redirect("/")
}