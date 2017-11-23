module.exports = {
  ensureAuthenticated: function(ctx, next){
    if(ctx.isAuthenticated()){
      return next();
    }
    ctx.flash('error_msg', 'Not Authorized');
    ctx.redirect('/users/login');
  }
};