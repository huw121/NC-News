const topicsRouter = require('express').Router();
const { getTopics } = require('../controllers/topicsControllers');
const { methodsErrors } = require('../errors/errors.js');

topicsRouter.route('/')
  .get(getTopics)
  .all(methodsErrors);

module.exports = topicsRouter;
