const app = require('./app.js');

const PORT = process.env.NODE_ENV || 9090;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}...`);
});