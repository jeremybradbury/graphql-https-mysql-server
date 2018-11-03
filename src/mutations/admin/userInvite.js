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
  resolve: (root, args, {req: {app: {url, db: {Users}}}, res}) => {
    return new Promise((resolve, reject) => {
      Users.findOrCreate({where: args})
        .spread((result,created) => { // like .then() splitting results
          user = result.dataValues
          var expires = new Date(user.expires);
          var now = new Date();
          if (user.password != null) {
            return res.json({data: {message:"Password already set"}});
          }
          if (expires.getTime() <= now.getTime()) { // expired 
            let token = result.tokenNew(1); // new 24 hour token
            user.token = token.token;
            user.expires = token.expires;
          }
          return res.json({data: {url: `${url}/new/${user.token}` }});
        })
        .catch(errors => reject(errors))
    })
  }
};