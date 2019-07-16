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
    it('responds 405 and a message when an invalid method is attempted', () => {
      const invalidMethods = ['patch', 'put', 'delete'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)[method]('/api/topics')
          .expect(405)
          .then(({ body: { message } }) => {
            expect(message).to.equal('method not allowed');
          })
      })
      return Promise.all(methodPromises);
    });
  });
  it('responds status 404 and an error message when a request is made on an invalid route', () => {
    return request(app)
      .get('/api/not-a-route')
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).to.equal("route not found");
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
    it('responds 405 and a message when an invalid method is attempted', () => {
      const invalidMethods = ['patch', 'put', 'delete'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)[method]('/api/users/1')
          .expect(405)
          .then(({ body: { message } }) => {
            expect(message).to.equal('method not allowed');
          })
      })
      return Promise.all(methodPromises);
    });
  });
  describe('/api/articles/:article_id', () => {
    describe('GET', () => {
      it('responds 200 with a article object', () => {
        return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'body',
              'topic',
              'created_at',
              'votes',
              'comment_count'
            );
            expect(article.article_id).to.equal(1);
          })
      })
      it('responds 200 with a article object when there are no comments', () => {
        return request(app)
          .get('/api/articles/2')
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'body',
              'topic',
              'created_at',
              'votes',
              'comment_count'
            );
            expect(article.article_id).to.equal(2);
            expect(article.comment_count).to.equal(0);
          })
      })
      it('responds 404 with a message when request is made with a non existant article id', () => {
        return request(app)
          .get('/api/articles/99999')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('article not found');
          })
      });
      it('responds 400 and a message when requesting with an invalid article id', () => {
        return request(app)
          .get('/api/articles/invalid')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid input syntax for integer: "invalid"');
          })
      });
    });
    describe('PATCH', () => {
      it('responds status 201 with the patched article', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 1 })
          .expect(201)
          .then(({ body: { article } }) => {
            expect(article).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'body',
              'topic',
              'created_at',
              'votes',
            )
            expect(article.votes).to.equal(101);
          });
      });
      it('responds 404 with a message when request is made with a non existant article id', () => {
        return request(app)
          .patch('/api/articles/99999')
          .send({ inc_votes: 1 })
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('article not found');
          })
      });
      it('responds 400 and a message when requesting with an invalid article id', () => {
        return request(app)
          .patch('/api/articles/invalid')
          .send({ inc_votes: 1 })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid input syntax for integer: "invalid"');
          })
      });
      it('responds 400 and a message when request is made with an invalid vote increment', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 'a' })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid input syntax for integer: "NaN"');
          })
      });
      it('responds 400 and a message when request is made with an invalid property', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ invalid_prop: 1 })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid request');
          })
      });
      it('responds 400 and a message when request is made without inc_votes', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({})
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid request');
          })
      });
      it('respond ignores additional properties in the request', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({
            inc_votes: 1,
            legs: 12,
            author: 'huw'
          })
          .expect(201)
          .then(({ body: { article } }) => {
            expect(article).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'body',
              'topic',
              'created_at',
              'votes',
            )
            expect(article.votes).to.equal(101);
            expect(article.author).to.equal('butter_bridge');
          });
      });
    });
    it('responds 405 and a message when an invalid method is attempted', () => {
      const invalidMethods = ['put', 'delete'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)[method]('/api/articles/1')
          .expect(405)
          .then(({ body: { message } }) => {
            expect(message).to.equal('method not allowed');
          })
      })
      return Promise.all(methodPromises);
    });
  });
});
