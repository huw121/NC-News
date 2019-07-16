const connection = require('../db/connection.js');

exports.selectUser = ({ username }) => {
  return connection('users')
    .select('*')
    .where({ username })
}
