
exports.up = function(connection) {
  return connection
    .schema
    .createTable('articles', (articlesTable) => {
      articlesTable.increments('article_id');
      articlesTable.string('title').notNullable();
      articlesTable.text('body').notNullable();
      articlesTable.integer('votes').defaultTo(0);
      articlesTable.string('topic');
      articlesTable.foreign('topic').references('topics.slug');
      articlesTable.string('author').notNullable();
      articlesTable.foreign('author').references('users.username');
      articlesTable.timestamp('created_at').defaultTo(connection.fn.now());
    })
};

exports.down = function(connection) {
  return connection
    .schema
    .dropTable('articles')
};
