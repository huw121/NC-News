process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const app = require('../app.js');
const request = require('supertest');
const connection = require('../db/connection.js');

describe('/api', () => {
  after(() => {
    connection.destroy();
  });
  describe('GET /api/topics', () => {
    it('responds with status 200 and a list of all topics', () => {
      return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          expect(body.topics[0]).to.have.all.keys(
            'description',
            'slug'
          );
        });
    });
  });
  it('responds status 404 and an error message when a request is made on an invalid route', () => {
    return request(app)
      .get('/api/not-a-route')
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).to.equal("Route Not Found");
      })
  });
});
