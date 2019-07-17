const { insertComment, selectAllComments, updateComment, delComment } = require('../models/commentsModels.js');

exports.postComment = (req, res, next) => {
  insertComment(req.params, req.body)
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(next);
}

exports.getComments = (req, res, next) => {
  selectAllComments(req.params, req.query)
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(next);
}

exports.patchComment = (req, res, next) => {
  updateComment(req.params, req.body)
    .then(comment => {
      res.status(200).send({ comment })
    })
    .catch(next);
}

exports.deleteComment = (req, res, next) => {
  delComment(req.params)
    .then(() => {
      res.sendStatus(204)
    })
    .catch(next)
}
