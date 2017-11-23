const Koa = require('koa');
const router = require('koa-router')();
const mongoose = require('../lib/mongoose');
const bcrypt = require('bcryptjs');
const passport = require('koa-passport');

// Load Idea Model
require('../models/User');
const User = mongoose.model('users');

exports.register = async function (ctx) {
    await ctx.render('users/register');
};


exports.login = async function (ctx) {
    await ctx.render('users/login');
};
exports.logout = async function (ctx) {
    ctx.logout();
    ctx.flash('success_msg', 'You are logged out');
    ctx.redirect('/users/login');
};



exports.loginPost = async function (ctx, next) {
    await passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true

    })(ctx, next);
};


// Register Form POST

exports.userPost = async function (ctx) {

    let user = ctx.request.body;
    let errors = [];

    if (user.password != user.password2){
        errors.push({text: 'Passwords do not much!'});
    }

    if (user.password.length < 4) {
        errors.push({text:'Password must be at least 4 characters'});
    }

    if (errors.length > 0) {

        await ctx.render('users/register', {
            errors: errors,
            name: user.name,
            email: user.email,
            password: user.password,
            password2: user.password2
        });
    } else {

        await User.findOne({email: ctx.request.body.email})
            .then(user => {
                if(user){
                    return ctx.redirect('/users/login');
                } else {
                    const newUser = new User({
                        name: ctx.request.body.name,
                        email: ctx.request.body.email,
                        password: ctx.request.body.password
                    });

                    let salt = bcrypt.genSaltSync(10);
                    newUser.password = bcrypt.hashSync(newUser.password, salt);
                    newUser.save();
                    ctx.redirect('/users/login');
                }
            });
    }

};