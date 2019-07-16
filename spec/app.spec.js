process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const app = require('../app.js');
const request = require('supertest');
const connection = require('../db/connection.js');

describe('/api', () => {
  after(() => {
    connection.destroy();
  });
  beforeEach(() => {
    return connection.seed.run();
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
  describe('GET /api/users/:username', () => {
    it('responds 200 with a user object with the properties username, avatar_url and name', () => {
      return request(app)
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user).to.have.all.keys(
            'username',
            'avatar_url',
            'name'
          );
          expect(user.username).to.equal('butter_bridge');
        })
    })
    it('responds 404 when request is made with a non existant username', () => {
      return request(app)
        .get('/api/users/notauser')
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).to.equal('user not found');
        })
    });
  });
});
