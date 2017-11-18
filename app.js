const render = require('./lib/render');
const logger = require('koa-logger');
const router = require('koa-router')();
const koaBody = require('koa-body');
const serve = require('koa-static');
const mongoose = require('mongoose');



const Koa = require('koa');
const app = module.exports = new Koa();

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect('mongodb://localhost/startup-dev', {
    useMongoClient: true
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

//manage static file
app.use(serve('./public'));




// middleware

app.use(logger());

app.use(render);

app.use(koaBody());


router
    .get('/', home)
    .get('/about', about);

router
    .get('/ideas/add', ideaAdd)
    .post('/ideas', ideaPost);




//routes

async function home(ctx) {

    await ctx.render('index');
}

async function about(ctx) {

    await ctx.render('about');
}

async function ideaAdd(ctx) {
    await ctx.render('ideas/add');
}

async function ideaPost(ctx) {

    let idea = ctx.request.body;
    let errors = [];

    // console.log(idea.title);
    // console.log(idea.details);

    if (!idea.title){
        errors.push({text:'Please add a title'});
        //console.log(errors);
    }

    if (!idea.details){
        errors.push({text:'Please add some details'});
        //console.log(errors);
    }

    if (errors.length > 0){
        let title = ctx.request.body.title;
        let details = ctx.request.body.details;

        await ctx.render('ideas/add', {
            errors: errors,
            title: title,
            details: details
        })

    } else {

        ctx.body= 'Passed';
    }
}






//server
app.use(router.routes());

const port = process.env.PORT || 3000;

app.listen(port, () =>{
    console.log(`Server started at http://localhost:${port}`);
});

// if (!module.parent) app.listen(3000, () =>{
//     console.log('Server running at http://localhost:3000');
// });