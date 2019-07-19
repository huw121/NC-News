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

exports.selectAllUsers = () => {
  return connection('users')
    .select('*')
}

exports.insertUser = ({username, avatar_url = 'https://avatars2.githubusercontent.com/u/24394918?s=400&v=1', name}) => {
  return connection('users')
    .insert({username, avatar_url, name})
    .returning('*')
    .then(user => user[0])
}
