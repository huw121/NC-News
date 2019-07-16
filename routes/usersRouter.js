const usersRouter = require('express').Router();
const { getUserByUsername } = require('../controllers/usersControllers');
const { methodsErrors } = require('../errors/errors.js')

usersRouter.route('/:username')
  .get(getUserByUsername)
  .all(methodsErrors);

module.exports = usersRouter;
