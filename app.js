const express = require('express');
const apiRouter = require('./routes/apiRouter.js');
const { routeError, serverError, customErrors, sqlErrors } = require('./errors/errors.js');
const app = express();

app.use('/api', apiRouter);

app.use(customErrors);
app.use(sqlErrors);
app.use(serverError);

app.all('/*', routeError);

module.exports = app;
