exports.routeError = (req, res) => {
  console.log('<<< IN ROUTE ERROR >>>')
  res
    .status(404)
    .send({ message: 'route not found' });
}

exports.customErrors = (err, req, res, next) => {
  console.log('<<< IN CUSTOM ERROR >>>')
  if (err.status) res.status(err.status).send({ message: err.message });
  else next(err);
}

exports.sqlErrors = (err, req, res, next) => {
  console.log('<<< IN SQL ERROR >>>')
  if (err.code) {
    res.status(400).send({ message: err.message.split(' - ')[1] })
  }
  else next(err);
}

exports.serverError = (err, req, res, next) => {
  console.log('<<< IN SERVER ERROR >>>');
  console.log(err);
}
