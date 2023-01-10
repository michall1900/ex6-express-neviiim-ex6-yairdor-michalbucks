exports.setCache = (res,req,next)=>{
    res.header('Cache-Control','no-store')
    next()
}