const { sendJSON } = require('../models/apiModels');

exports.getApiJSON = (req, res, next) => {
  const json = sendJSON();
  res.status(200).send(json);
}
