const usersRouter = require('express').Router();
const { getUserByUsername } = require('../controllers/usersControllers');

usersRouter.route('/:username').get(getUserByUsername);

module.exports = usersRouter;
