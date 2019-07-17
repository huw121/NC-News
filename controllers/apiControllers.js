const { sendJSON } = require('../models/apiModels');

exports.getApiJSON = (req, res, next) => {
  sendJSON()
    .then(json => {
      res.status(200).send(json);
    })
    .catch(next);
}
