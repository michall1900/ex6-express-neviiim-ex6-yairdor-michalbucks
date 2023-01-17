const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


const app = express();

app.set('etag', false)

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const forAllRoutes = require('./routes/forAll');
const apiRoutes = require('./routes/api');


// plug in the body parser middleware and static middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(forAllRoutes)
app.use(loginRoutes);
app.use('/users', registerRoutes);
app.use('/api', apiRoutes);


//app.use(errorController.get404)
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
app.use(errorController.get404);
let port = process.env.PORT || 3000;
app.listen(port);
