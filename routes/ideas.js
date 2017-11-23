const Koa = require('koa');
const router = require('koa-router')();
const mongoose = require('../lib/mongoose');
const {ensureAuthenticated} = require('../helpers/auth');



// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

exports.ideaFetch = async function(ctx, next) {
    await Idea.find({user: ctx.req.user.id})
        .sort({date:'desc'})
        .then(ideas => {
            return ctx.render('ideas/idea_list', {
                ideas:ideas
            });
        });
};


exports.ideaAdd = async function(ctx, next) {
    await ctx.render('ideas/idea_add');
};

exports.ideaEdit = async function(ctx, next) {
    await Idea.findOne({
        _id: ctx.params.id
    })
        .then(idea => {
            // return ctx.render('ideas/idea_edit', {
            //     idea:idea
            // });

            if(idea.user != ctx.req.user.id){
                ctx.flash('error_msg', 'Not Authorized');
                return ctx.redirect('/ideas');
            } else {
                return ctx.render('ideas/idea_edit', {
                    idea:idea
                });
            }
        });
};

exports.ideaPut = async function(ctx, next) {
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
};

exports.ideaDelete = async function(ctx, next) {
    await Idea.remove({_id: ctx.params.id})
        .then(() => {
            //ctx.flash('success_msg', 'Video idea removed');
            ctx.redirect('/ideas', {success_msg:'Video idea removed' });
        });
};

exports.ideaPost = async function(ctx, next) {
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
            details: ctx.request.body.details,
            user: ctx.req.user.id

        };

        await new Idea(newUser)
            .save()
            .then( idea => {
                ctx.flash('success_msg', 'Video idea added');
                return ctx.redirect('/ideas');
            })
    }
};

