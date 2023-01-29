const Cookies = require("cookies");
const cookiesHandler = require('../modules/cookiesHandler.js')

/**
 * Return error page.
 * @param req
 * @param res
 */
exports.get404 = (req, res) => {
  res.status(404).render('error', {
    tabTitle: 'Page Not Found',pageTitle:'Error',subTitle:"Some error occurred!",error:"Page Not Found!" });
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