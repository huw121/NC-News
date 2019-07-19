const topicsRouter = require('express').Router();
const { getTopics, postTopic } = require('../controllers/topicsControllers');
const { methodsErrors } = require('../errors/errors.js');

topicsRouter.route('/')
  .get(getTopics)
  .post(postTopic)
  .all(methodsErrors);

module.exports = topicsRouter;
