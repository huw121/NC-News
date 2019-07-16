const connection = require('../db/connection.js');

exports.selectUser = ({ username }) => {
  return connection('users')
    .select('*')
    .where({ username })
    .then(user => {
      if (!user.length) return Promise.reject({status: 404, message: 'user not found'});
      return user;
    })
}
