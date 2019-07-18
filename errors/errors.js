exports.routeError = (req, res) => {
  //console.log('<<< IN ROUTE ERROR >>>');
  res.status(404).send({ message: 'route not found' });
}

exports.customErrors = (err, req, res, next) => {
  //console.log('<<< IN CUSTOM ERROR >>>');
  if (err.status) res.status(err.status).send({ message: err.message });
  else next(err);
}

exports.sqlErrors = (err, req, res, next) => {
  //console.log('<<< IN SQL ERROR >>>');
  if (err.code) {
    const codes = {
      "22P02": {status: 400, message: 'INVALID TEXT REPRESENTATION'},
      23502: {status: 400, message: 'NOT NULL VIOLATION'},
      23503: {status: 404, message: 'FOREIGN KEY VIOLATION'},
      42703: {status: 400, message: 'UNDEFINED COLUMN'}
    }
    res.status(codes[err.code].status).send({message: codes[err.code].message})
  }
  else next(err);
}

exports.methodsErrors = (req, res) => {
  //console.log('<<< IN METHODS ERROR >>>');
  res.status(405).send({ message: 'method not allowed' });
}

exports.serverError = (err, req, res, next) => {
  console.log('<<< IN SERVER ERROR >>>');
  console.log(err);
}
