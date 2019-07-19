const usersRouter = require('express').Router();
const { getUserByUsername, getAllUsers, postUser } = require('../controllers/usersControllers');
const { methodsErrors } = require('../errors/errors.js')

usersRouter.route('/:username')
  .get(getUserByUsername)
  .all(methodsErrors);

usersRouter.route('/')
  .get(getAllUsers)
  .post(postUser)
  .all(methodsErrors);

module.exports = usersRouter;
