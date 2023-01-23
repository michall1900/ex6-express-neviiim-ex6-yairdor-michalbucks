exports.getHome = (req, res)=>{
    console.log(req.session.username.toString())
    res.render('home',{
        tabTitle: "Home",
        username: req.session.username.toString(),
        error: req.data.error,
    })
}