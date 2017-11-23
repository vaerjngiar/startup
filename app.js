const render = require('./lib/render');
const {ensureAuthenticated} = require('./helpers/auth');
const logger = require('koa-logger');
const router = require('koa-router')();
const koaBody = require('koa-body');
const serve = require('koa-static');
const mongoose = require('./lib/mongoose');
const passport = require('koa-passport');

const session = require('koa-generic-session');
const flash = require('koa-connect-flash');
//const flash = require('connect-flash');

const path = require('path');
const fs = require('fs');
const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();

const Koa = require('koa');
const app = module.exports = new Koa();

middlewares.forEach(function(middleware) {
    app.use(require('./middlewares/' + middleware));
});

//manage static file
app.use(serve('./public'));

const methodOverride = require('koa-methodoverride');

app.use(methodOverride('_method'));

// flash and session
app.keys = ['secret'];
app.use(session());


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// middleware

app.use(logger());

app.use(render);

app.use(koaBody());

// Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);

router.get('/', require('./routes/home').get);
router.get('/about', require('./routes/about').get);

router.get('/ideas', ensureAuthenticated, ideas.ideaFetch);
router.get('/ideas/add', ensureAuthenticated, ideas.ideaAdd);
router.get('/ideas/edit/:id', ensureAuthenticated, ideas.ideaEdit);
router.put('/ideas/:id', ensureAuthenticated, ideas.ideaPut);
router.del('/ideas/:id', ensureAuthenticated, ideas.ideaDelete);
router.post('/ideas', ensureAuthenticated, ideas.ideaPost);

router.get('/users/login', users.login);
router.post('/users/login', users.loginPost);
router.get('/users/register', users.register);
router.post('/users/register', users.userPost);
router.get('/users/logout', users.logout);



//server
app.use(router.routes());

const port = process.env.PORT || 3000;

app.listen(port, () =>{
    console.log(`Server started at http://localhost:${port}`);
});

// if (!module.parent) app.listen(3000, () =>{
//     console.log('Server running at http://localhost:3000');
// });