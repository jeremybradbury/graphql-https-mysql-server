const limit = 5;
exports.limit = limit;
exports.logout = function(req,res) {
  req.logOut(); 
  req.session.destroy(() => {
    res.redirect('/dash');
  });
};
exports.views = {};
exports.views.login = function(req,res) { // login view
  res.render('login.ejs', { 
      message: req.flash('loginMessage'), 
      local: {
        url: req.url, 
        user : ''
      }
  });
};
exports.views.homeHide = function(req,res) {
  if (req.isAuthenticated()) {
    res.redirect('/dash'); // users welcome
  }
  res.end(); // hide from anon
};
exports.views.homeShow = function(req,res) {
  if (req.isAuthenticated()) {
    res.redirect('/dash'); // users welcome
  }
  res.redirect('/login'); // show them the lock
};
exports.views.dash = function(req,res) { // dash view
  res.render('dash.ejs', { 
    local: {
      url: req.url, 
      user : req.user, 
      impersonate: false
    } 
  }); 
};
exports.views.new = function(req,res) { // new user/password view
  req.app.db.Users.findByToken(req.params.token)
    .then(user => {
      if(user instanceof Error || !user.status) { // valid user without a flasey status
        res.sendStatus(401);
      } else {
        if(!user.password) { // empty password == new user
          res.render('new.ejs', {local: { user: user }});
        } else {
          res.redirect('/dash'); // password is already set, go login fool (or home if you are logged in)
        }
      }
    })
};
exports.views.admin = {};
exports.views.admin.dash = function(req,res) { // admin dash view
  let local = {url: req.url, user : req.user};
  req.app.db.Users.findAndCountAll({ 
    attributes: { exclude: ['password'] }, 
    order: [['createdAt', 'DESC']],
    limit: limit
  }).then(users => {
    local.page = {
      next: 2,
      prev: false
    };
    local.users = users.rows;
    res.render('admin.ejs', {
      message: req.flash('inviteMessage'), 
      local: local
    });
  });
}; 
exports.views.admin.dashPaged = function(req,res) {  // admin dash pagination
  let page = parseInt(req.params.page);
  if (isNaN(page) || page < 1) {
    return res.sendStatus(400); 
  }
  let offset = (req.params.page-1) * limit;
  let local = {url: req.url, user : req.user};
  req.app.db.Users.findAndCountAll({ 
    attributes: { exclude: ['password'] }, 
    order: [['createdAt', 'DESC']],
    offset: offset,
    limit: limit
  }).then(users => {
    if (users.length < 1 || offset>=users.count) { 
      return res.sendStatus(400); 
    }
    local.page = {
      prev: ((offset-1) > 0) ? page-1 : false, 
      next: (offset+limit<users.count) ? page+1 : false
    };        
    local.users = users.rows;
    res.render('admin.ejs', {
      message: req.flash('inviteMessage'), 
      local: local
    });
  });
}; 
exports.views.admin.userImpersonate = function(req,res) { // user impersonation dash view
  req.app.db.Users.findById(req.params.id)
    .then(user => {
      res.render('dash.ejs', {local: {user: user, impersonate: req.user.email }});
    })
};
exports.isLoggedIn = function (req, res, next) { // user auth middleware
  if (req.isAuthenticated()) return next(); // proceed to next middleware
  req.session.returnTo = req.url; // dont forget where we came
  res.redirect('/login'); // not authenticated
}
exports.isAdmin = function (req, res, next) { // admin middleware
  if(req.user.status == 'manage-users') return next(); // proceed to next middleware
  res.sendStatus(403); // not allowed
}