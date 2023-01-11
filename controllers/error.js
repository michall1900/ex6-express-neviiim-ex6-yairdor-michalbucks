const Cookies = require("cookies");
const cookiesHandler = require('../modules/cookiesHandler.js')

/**
 * Return error page.
 * @param req
 * @param res
 */
exports.get404 = (req, res) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found', path : '' });
};
/**
 * Set the error message inside req.data.
 * @param req
 * @param res
 * @param next
 */
exports.getErrorCookie = (req, res, next) => {
  let cookies = new Cookies(req,res);
  req.data.error = cookies.get(cookiesHandler.ERROR_COOKIE_NAME)
  cookies.set(cookiesHandler.ERROR_COOKIE_NAME,'',{maxAge:0})
  next()

}