const renderHome = require("../modules/renders.js").getHome

/**
 * Render the home page with error if needed, username, includes also token inside the dom and put error message
 * if needed.
 * @param req
 * @param res
 */
exports.getHome = (req, res)=>{
    renderHome(req,res)
}

/**
 * This route is handle with logout request - destroy the current session and send redirect response to client.
 * @param req
 * @param res
 */
exports.getLogout = (req,res) =>{
    req.session.destroy();
    (req.headers && req.headers['x-is-fetch'] === 'true')? res.send(302).json({redirect:'/'}):res.redirect("/")
}