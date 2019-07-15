const topicsRouter = require('express').Router();
const { getTopics } = require('../controllers/topicsControllers');

topicsRouter.route('/').get(getTopics);

module.exports = topicsRouter;
