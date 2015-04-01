var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// load .env
require('dotenv').load();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());

/* MySql connection */
var connection  = require('express-myconnection'),
    mysql = require('mysql');

var db_url = process.env.DATABASE_URL || process.env.CLEARDB_DATABASE_URL
app.use(connection(mysql, db_url, 'request'));

// LOAD SIGNED IN USER
app.use(function(req, res, next){

      req.getConnection(function(err, connection) {
        if (err) return next(err);
        connection.query(
            'SELECT * FROM users WHERE id = ?',
            [req.cookies.user_id],
            function(err, results) {

          if (err) return next(err);

          if (results.length > 0){
            res.locals.current_user = results[0]
            req.current_user = results[0]
          } else {
            res.locals.current_user = null
            req.current_user = null
          }

          next();
        });
      });

})

// INITIALIZE VIEW VARIABLES
app.use(function(req, res, next){
  res.locals.alert_error = req.cookies.alert_error
  res.clearCookie('alert_error')

  res.locals.alert_success = req.cookies.alert_success
  res.clearCookie('alert_success')

  next();
})

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
