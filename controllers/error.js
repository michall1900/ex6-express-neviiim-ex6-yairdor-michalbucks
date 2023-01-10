const Cookies = require("cookies");
const cookiesHandler = require('../modules/cookiesHandler.js')

exports.get404 = (req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found', path : '' });
};
exports.getErrorCookie = (req, res, next) => {
  let cookies = new Cookies(req,res);
  req.data = cookies.get(cookiesHandler.ERROR_COOKIE_NAME)
  cookies.set(cookiesHandler.ERROR_COOKIE_NAME,'',{maxAge:0})
  next()

}