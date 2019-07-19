const { selectAllTopics, insertTopic } = require('../models/topicsModels');

exports.getTopics = (req, res, next) => {
  selectAllTopics()
    .then(topics => {
      res.status(200)
        .send({ topics })
    })
    .catch(next);
}

exports.postTopic = (req, res, next) => {
  insertTopic(req.body)
    .then(topic => {
      res.status(201).send({ topic });
    })
    .catch(next);
}