const { GraphQLNonNull } = require('graphql');
const UserType = require('../../types/user');
const UserInputType = require('../../types/input/user');
const { appConfig } = require('../../config');
//const socket = require('../../socket');

module.exports = {
  type: UserType,
  description: 'Email is required',
  args: {
    data: {
      name: 'data',
      type: new GraphQLNonNull(UserInputType)
    }
  },
  resolve: (root, { data }, {req: {app: {db: {User}}},res}) => {
    return new Promise((resolve, reject) => {
      User.sync()
        .then(() => {
          return User.findOrCreate({where: data});
        })
        .spread((result,created) => { // like .then() splitting results
          if(created){
            user = result.dataValues
            console.log(user);
            var expires = new Date(user.expires);
            var now = new Date();
            if (expires.getTime() <= now.getTime()) { // expired 
              var token = result.tokenNew(1); // new 24 hour token
              user.token = token.token;
              user.expires = token.expires;
            }
            let url = (process.env.NODE_ENV == 'development') ? `${appConfig.url}:${appConfig.port}` : `${appConfig.url}`;
            res.json({data: {url: `${url}/new/${user.token}`}});
            resolve(user);
          } else {
            throw new Error('User already exists.');
          }
        })
        .catch(errors => reject(errors))
    })
  }
};