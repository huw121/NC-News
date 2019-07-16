const { selectArticle } = require('../models/articlesModels.js')

exports.getArticlesById = (req, res, next) => {
  selectArticle(req.params)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
}