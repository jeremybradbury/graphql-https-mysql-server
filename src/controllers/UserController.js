var limit;
exports.limit = limit = 5;
exports.admin = {};
exports.views = {};
exports.admin.views = {};

/* json endpoints */
exports.logout = function(req,res) {
  req.logOut(); 
  req.session.destroy(() => {
    res.redirect('/dash');
  });
};

exports.getMyToken = function(req,res) {
  req.app.db.Users.getTokenById(req.user.id)
    .then(user => {
      let data = user.get();
      res.json({data: { // user's dataa
        id: req.user.id,
        token: data.token,
        expires: data.expires,
        status: data.status 
      }});
    });
};

exports.renewMyToken = function(req,res) {
  req.app.db.Users.findById(req.user.id)
    .then(user => {
      let data = user.tokenNew();
      data.status = user.status; // user's status
      data.id = req.user.id;
      res.json({data: data});
    });
};

exports.resetMyPassword = function(req,res) {
  req.app.db.Users.findById(req.user.id)
    .then(user => {
      res.json({data: {password: user.resetPass()}});
    });
};

/* ejs views */
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
      user: req.user,
      type: 'User',
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

exports.admin.views.dash1 = function(req,res) { 
  let q = req.url.split('?')[1]; // forward query
  let url = (!q) ? '/admin/users/' : '/admin/users/?'+q; 
  res.redirect(url);
}

exports.admin.views.dash = function(req,res) { // admin dash view
  let local = {url: req.url, user : req.user};
  let query = { 
    attributes: { exclude: ['password'] }, 
    order: [['createdAt', 'DESC']],
    limit: limit
  };
  if(Object.keys(req.query).length>0) {
    let filter = req.query;
    var where = {};
    var order = {};
    for(i in filter) {
      switch (i) {
        case 'sort':
        case 'dir':
          order[i] = filter[i];
          break;
        case 'limit':
          query.limit = parseInt(filter[i]) || limit;
          break;
        default:
          where[i] = (filter[i]=='null') ? {$eq: null} : {$like: `%${filter[i]}%`};
          break;
      }
    }
    query.where = where;
    if (Object.keys(order).length>0) {
      if(order.sort){ query.order = [order.sort]; }
      if(order.dir){ query.order.push(order.dir); }
      query.order = [query.order];
    }
  }
  req.app.db.Users.findAndCountAll(query)
    .then(users => {
      local.page = {
        next: (users.count>query.limit) ? 2 : false,
        prev: false
      };
      local.users = users.rows;
      local.type = 'User';
      res.render('admin.ejs', {
        message: req.flash('inviteMessage'), 
        local: local
      });
    });
};

exports.admin.views.dashPaged = function(req,res) {  // admin dash pagination
  let page = parseInt(req.params.page);
  if (isNaN(page) || page < 1) {
    return res.sendStatus(400); 
  }
  let offset = (req.params.page-1) * limit;
  let local = {url: req.url, user : req.user};
  let query = { 
    attributes: { exclude: ['password'] }, 
    order: [['createdAt', 'DESC']],
    limit: limit,
    offset: offset
  };
  if(Object.keys(req.query).length>0) {
    let filter = req.query;
    var where = {};
    var order = {};
    for(i in filter) {
      switch (i) {
        case 'sort':
        case 'dir':
          order[i] = filter[i];
          break;
        case 'limit':
          query.limit = parseInt(filter[i]) || limit;
          query.offset = (req.params.page-1) * query.limit;
          break;
        default:
          where[i] = (filter[i]=='null') ? {$eq: null} : {$like: `%${filter[i]}%`};
          break;
      }
    }
    query.where = where;
    if (Object.keys(order).length>0) {
      if(order.sort){ query.order = [order.sort]; }
      if(order.dir){ query.order.push(order.dir); }
      query.order = [query.order];
    }
  }
  req.app.db.Users.findAndCountAll(query)
    .then(users => {
      if (users.count < 1) { 
        return res.sendStatus(400); 
      }
      local.page = {
        paged: true,
        prev: ((query.offset-1) > 0) ? page-1 : false, 
        next: (query.offset+query.limit<users.count) ? page+1 : false
      };
      local.users = users.rows;
      local.type = 'User';
      res.render('admin.ejs', {
        message: req.flash('inviteMessage'), 
        local: local
      });
    });
};

exports.admin.views.recover1 = function (req,res) { // redirect /recover/1 to /recover/
  let q = req.url.split('?')[1]; // forward query 
  let url = (!q) ? '/admin/users/recover/' : '/admin/users/recover/?'+q; // if exists
  res.redirect(url);
};

exports.admin.views.recover = function(req,res) { // recover delted users
  let local = {url: req.url, user : req.user};
  let deleted = {deletedAt: {$ne: null }};
  let query = { 
    where: deleted, 
    attributes: { exclude: ['password'] }, 
    order: [['deletedAt', 'DESC']],
    limit: limit,
    paranoid: false
  };
  if(Object.keys(req.query).length>0) {
    let filter = req.query;
    var where = {};
    var order = {};
    let and = []; 
    for(i in filter) {
      switch (i) {
        case 'sort':
        case 'dir':
          order[i] = filter[i];
          break;
        case 'limit':
          query.limit = parseInt(filter[i]) || limit;
          break;
        default:
          where[i] = (filter[i]=='null') ? {$eq: null} : {$like: `%${filter[i]}%`};
          break;
      }  
    }
    and.push(deleted);
    and.push(where);
    query.where = {$and: and};
    if (Object.keys(order).length>0) {
      if(order.sort){ query.order = [order.sort]; }
      if(order.dir){ query.order.push(order.dir); }
      query.order = [query.order];
    }
  }
  req.app.db.Users.findAndCountAll(query)    
    .then(users => {
      local.page = {
        next: (users.count>query.limit) ? 2 : false,
        prev: false
      };
      local.users = users.rows;
      local.type = 'User';
      res.render('admin.ejs', {
        message: req.flash('inviteMessage'), 
        local: local
      });
    });
};

exports.admin.views.recoverPaged = function(req,res) { // recover delted users pagination
  let page = parseInt(req.params.page);
  if (isNaN(page) || page < 1) {
    return res.sendStatus(400); 
  }
  let offset = (req.params.page-1) * limit;
  let local = {url: req.url, user : req.user};
  let deleted = {deletedAt: {$ne: null }};
  let query = { 
    where: deleted, 
    attributes: { exclude: ['password'] }, 
    order: [['deletedAt', 'DESC']],
    offset: offset,
    limit: limit,
    paranoid: false
  };
  if(Object.keys(req.query).length>0) {
    let filter = req.query;
    var where = {};
    var order = {};
    let and = [];
    for(i in filter) {
      switch (i) {
        case 'sort':
        case 'dir':
          order[i] = filter[i];
          break;
        case 'limit':
          query.limit = parseInt(filter[i]) || limit;
          query.offset = (req.params.page-1) * query.limit;
          break;
        default:
          where[i] = (filter[i]=='null') ? {$eq: null} : {$like: `%${filter[i]}%`};
          break;
      }
    }
    and.push(deleted);
    and.push(where);
    query.where = {$and: and};
    if (Object.keys(order).length>0) {
      if(order.sort){ query.order = [order.sort]; }
      if(order.dir){ query.order.push(order.dir); }
      query.order = [query.order];
    }
  }
  req.app.db.Users.findAndCountAll(query)
  .then(users => {
    if (users.count < 1) {
      return res.sendStatus(400); 
    }
    local.page = {
      paged: true,
      prev: ((query.offset-1) > 0) ? page-1 : false, 
      next: (query.offset+query.limit<users.count) ? page+1 : false
    };        
    local.users = users.rows;
    local.type = 'User';
    res.render('admin.ejs', {
      message: req.flash('inviteMessage'), 
      local: local
    });
  });
};

exports.admin.views.userImpersonate = function(req,res) { // user impersonation dash view
  req.app.db.Users.findById(req.params.id)
    .then(user => {
      res.render('dash.ejs', {local: {user: user, impersonate: req.user.email }});
    })
};