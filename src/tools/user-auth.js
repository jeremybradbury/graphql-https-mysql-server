var mysql = require("mysql"), crypto = require('crypto'), bcrypt = require('bcryptjs');
module.exports = function (connection,req,cb) {
  if(req.body && req.body.email){
    var query = "SELECT * FROM ?? LEFT JOIN ?? ON (??.??=??.??) WHERE ?? = ?";
    var table = ["user","user_token","user","user_id","user_token","user_id_fk","email",req.body.email]
    query = mysql.format(query,table);
    connection.query(query,function(err,rows){
      if(!err && rows.length > 0) {
        bcrypt.compare(req.body.password, rows[0].password, function(err, found) {
          if(found){
            return cb(null,rows[0]);
          } else {
            return cb("Error finding requested user/password.",null);
          }
        });
      } else {
        return cb(err,null); 
      } 
    });
  } else {
    return cb("No user provided.",null);
  }
}