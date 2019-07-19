const { selectUser, selectAllUsers, insertUser } = require('../models/usersModels');

exports.getUserByUsername = (req, res, next) => {
  selectUser(req.params)
    .then(([user]) => {
      res.status(200)
        .send({ user });
    })
    .catch(next);
}

exports.getAllUsers = (req, res, next) => {
  selectAllUsers()
    .then(users => {
      res.status(200).send({ users });
    })
    .catch(next);
}

exports.postUser = (req, res, next) => {
  insertUser(req.body)
    .then(user => {
      res.status(201).send({user})
    })
    .catch(next);
}
