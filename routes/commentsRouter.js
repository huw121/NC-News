const commentsRouter = require('express').Router();
const { patchComment, deleteComment } = require('../controllers/commentsControllers.js')
const { methodsErrors } = require('../errors/errors.js');

commentsRouter.route('/:comment_id')
  .patch(patchComment)
  .delete(deleteComment)
  .all(methodsErrors);

module.exports = commentsRouter;
