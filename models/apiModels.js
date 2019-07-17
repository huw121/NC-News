const fs = require('fs');

exports.sendJSON = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('./endpoints.json', (err, json) => {
      if (err) reject(err);
      else resolve(json);
    })
  })
}
