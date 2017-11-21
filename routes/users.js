const Koa = require('koa');
const router = require('koa-router')();
const mongoose = require('../lib/mongoose');


// User Login Route
router.get('/login', async (ctx)=>{
    ctx.body = 'Login'
});

// User Register Route
router.get('/register', async (ctx)=>{
    ctx.body = 'Register'
});

module.exports = router;