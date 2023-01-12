/**
 * Sets browser's cache settings.
 * @param req
 * @param res
 * @param next
 */
exports.setCache = (req,res,next)=>{
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0,' +
        ' pre-check=0, max-age=0, s-maxage=0');
    next()
}