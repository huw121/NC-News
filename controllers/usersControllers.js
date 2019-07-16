const { selectUser } = require('../models/usersModels');

exports.getUserByUsername = (req, res, next) => {
  selectUser(req.params)
    .then(([user]) => {
      res.status(200)
        .send({ user });
    })
    .catch(next);
}
