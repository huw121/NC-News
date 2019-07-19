const { selectArticle, updateArticle, selectAllArticles, delArticle } = require('../models/articlesModels.js')

exports.getArticlesById = (req, res, next) => {
  selectArticle(req.params)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
}

exports.patchArticleById = (req, res, next) => {
  updateArticle(req.params, req.body)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
}

exports.getAllArticles = (req, res, next) => {
  selectAllArticles(req.query)
    .then(([articles, totalCount]) => {
      res.status(200).send({ articles, totalCount })
    })
    .catch(next);
}

exports.deleteArticleById = (req, res, next) => {
  delArticle(req.params)
    .then(() => {
      res.sendStatus(204)
    })
    .catch(next);
}
