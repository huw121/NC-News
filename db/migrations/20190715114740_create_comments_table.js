
exports.up = function(connection) {
  return connection
    .schema
    .createTable('comments', (commentsTable) => {
      commentsTable.increments('comment_id');
      commentsTable.string('author');
      commentsTable.foreign('author').references('users.username');
      commentsTable.integer('article_id').unsigned();
      commentsTable.foreign('article_id').references('articles.article_id');
      commentsTable.integer('votes').defaultTo(0);
      commentsTable.timestamp('created_at').defaultTo(connection.fn.now());
      commentsTable.text('body').notNullable();
    })
};

exports.down = function(connection) {
  return connection
    .schema
    .dropTable('comments');
};
