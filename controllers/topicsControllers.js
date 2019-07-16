const { selectAllTopics } = require('../models/topicsModels');

exports.getTopics = (req, res, next) => {
  selectAllTopics()
    .then(topics => {
      res.status(200)
        .send({ topics })
    })
    .catch(next);
} 
