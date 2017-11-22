const render = require('./lib/render');
const logger = require('koa-logger');
const router = require('koa-router')();
const koaBody = require('koa-body');
const serve = require('koa-static');
const mongoose = require('./lib/mongoose');

const session = require('koa-generic-session');
//const flash = require('koa-connect-flash');

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

//app.use(flash());

// middleware

app.use(logger());

app.use(render);

app.use(koaBody());

// Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');


router.get('/', require('./routes/home').get);
router.get('/about', require('./routes/about').get);

router.get('/ideas', ideas.ideaFetch);
router.get('/ideas/add', ideas.ideaAdd);
router.get('/ideas/edit/:id', ideas.ideaEdit);
router.put('/ideas/:id', ideas.ideaPut);
router.del('/ideas/:id', ideas.ideaDelete);
router.post('/ideas', ideas.ideaPost);

router.get('/users/login', users.login);
router.get('/users/register', users.register);
router.post('/users/register', users.userPost);



//server
app.use(router.routes());

const port = process.env.PORT || 3000;

app.listen(port, () =>{
    console.log(`Server started at http://localhost:${port}`);
});

// if (!module.parent) app.listen(3000, () =>{
//     console.log('Server running at http://localhost:3000');
// });