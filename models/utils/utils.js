const connection = require('../../db/connection.js')

exports.rowCount = (table, author, topic, idCol, idVal) => {
  return connection(table)
    .select('*')
    .modify((query) => {
      if (author) query.where('articles.author', author);
      if (topic) query.where({ topic });
      if (idCol && idVal) query.where(idCol, idVal);
    })
    .then(rows => rows.length);
}

exports.doesRowExistInTable = (table, identifierColumn, identifierRow) => {
  return connection(table)
    .select('*')
    .where(identifierColumn, identifierRow)
    .then(array => {
      return array.length !== 0;
    })
}
