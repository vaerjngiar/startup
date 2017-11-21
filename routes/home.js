exports.get = async function(ctx, next) {
    await ctx.render('index');
};