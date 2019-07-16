const { insertComment } = require('../models/commentsModels.js');

exports.postComment = (req, res, next) => {
  insertComment(req.params, req.body)
    .then(comment => {
      res.status(201).send({comment});
    })
    .catch(next);
}
