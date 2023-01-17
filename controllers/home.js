exports.getHome = (req, res)=>{
    res.render('home',{
        tabTitle: "Home",
        error: req.data.error,
    })
}