var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
var port = process.env.port || 3000;

var routes = require('./routes/index');
var users = require('./routes/users');

//var db = mongojs('test', ['users']);
mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;



//view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');

app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: 'secret',
    saveUnitiliazed: true,
    resace: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null; 
  next();
});

app.use('/', routes);
app.use('/users', users);


app.listen(port, function () {
    console.log('Express server started on port: ' + port);
});
