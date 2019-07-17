const { insertComment, selectAllComments } = require('../models/commentsModels.js');

exports.postComment = (req, res, next) => {
  insertComment(req.params, req.body)
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(next);
}

exports.getComments = (req, res, next) => {
  selectAllComments(req.params)
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(next);
}
