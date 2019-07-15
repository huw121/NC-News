exports.routeError = (req, res) => {
  res
    .status(404)
    .send({ message: 'Route Not Found' });
}

exports.serverError = (err, req, res, next) => {
  console.log('<<< IN SERVER ERROR >>>');
  console.log(err);
}
