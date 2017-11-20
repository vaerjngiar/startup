const render = require('./lib/render');
const logger = require('koa-logger');
const router = require('koa-router')();
const koaBody = require('koa-body');
const serve = require('koa-static');
const mongoose = require('./lib/mongoose');



const Koa = require('koa');
const app = module.exports = new Koa();


// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

//manage static file
app.use(serve('./public'));

const methodOverride = require('koa-methodoverride');

app.use(methodOverride('_method'));

// middleware

app.use(logger());

app.use(render);

app.use(koaBody());


router
    .get('/', home)
    .get('/about', about);


router
    .get('/ideas/add', ideaAdd)
    .get('/ideas', ideaFetch)
    .get('/ideas/edit/:id', ideaEdit)
    .put('/ideas/:id',ideaPut)
    .del('/ideas/:id',ideaDelete)
    .post('/ideas', ideaPost);





//routes

async function home(ctx) {

    await ctx.render('index');
}

async function about(ctx) {

    await ctx.render('about');
}

async function ideaFetch(ctx) {

    await Idea.find({})
        .sort({date:'desc'})
        .then(ideas => {
            return ctx.render('ideas/idea_list', {
                ideas:ideas
            });
        });
}

async function ideaEdit(ctx) {
    await Idea.findOne({
        _id: ctx.params.id
    })
        .then(idea => {
            return ctx.render('ideas/idea_edit', {
                idea:idea
            });
        });
}

async function ideaAdd(ctx) {
    await ctx.render('ideas/idea_add');
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

        await ctx.render('ideas/idea_add', {
            errors: errors,
            title: title,
            details: details
        })

    } else {

        const newUser = {
            title: ctx.request.body.title,
            details: ctx.request.body.details
        };

        await new Idea(newUser)
            .save()
            .then( idea => {
                return ctx.redirect('/ideas');
            })
    }
}

// Edit Form process


async function ideaPut(ctx) {
    await Idea.findOne({
        _id: ctx.params.id
    })
        .then(idea => {
            // new values
            idea.title = ctx.request.body.title;
            idea.details = ctx.request.body.details;

            idea.save();
            ctx.redirect('/ideas');
        });
}

async function ideaDelete(ctx) {
    await Idea.remove({_id: ctx.params.id})
        .then(() => {
            //ctx.flash('success_msg', 'Video idea removed');
            ctx.redirect('/ideas');
        });
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