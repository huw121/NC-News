
exports.up = function(connection) {
  return connection
    .schema
    .createTable('topics', (topicsTable) => {
      topicsTable.string('slug').primary().unique();
      topicsTable.string('description').notNullable();

    })
    .createTable('users', (usersTable) => {
      usersTable.string('username').primary().unique();
      usersTable.string('avatar_url');
      usersTable.string('name').notNullable();
    })
};

exports.down = function(connection) {
  return connection
    .schema
    .dropTable('topics')
    .dropTable('users')
};
