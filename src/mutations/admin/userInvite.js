const { 
  GraphQLString,
  GraphQLID,
  GraphQLNonNull 
} = require('graphql');
const UserType = require('../../types/user');
//const socket = require('../../socket');

module.exports = {
  type: UserType,
  description: 'Email required',
  args: {
    email: {
      name: 'email',
      type: new GraphQLNonNull(GraphQLString),
      description: 'Email required'
    }
  },
  resolve: (root, { data }, {req: {app: {url,db: {User}}},res}) => {
    return new Promise((resolve, reject) => {
      User.sync()
        .then(() => {
          return User.findOrCreate({where: data});
        })
        .spread((result,created) => { // like .then() splitting results
          user = result.dataValues
          var expires = new Date(user.expires);
          var now = new Date();
          if (expires.getTime() <= now.getTime()) { // expired 
            var token = result.tokenNew(1); // new 24 hour token
            user.token = token.token;
            user.expires = token.expires;
          }
          res.json({data: {url: `${url}/new/${user.token}`}});
          resolve(user);
        })
        .catch(errors => reject(errors))
    })
  }
};