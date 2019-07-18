const ENV = process.env.NODE_ENV || "development";

const data = {
  test: require('./test-data'),
  development: require('./development-data'),
  production: require('./development-data')
}

module.exports = data[ENV];
