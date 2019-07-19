process.env.NODE_ENV = 'test';
const chai = require('chai');
const expect = chai.expect;
chai.use(require("chai-sorted"));
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
  it('ERROR 405 method not allowed', () => {
    const invalidMethods = ['put', 'post', 'patch', 'delete'];
    const methodPromises = invalidMethods.map(method => {
      return request(app)[method]('/api')
        .expect(405)
        .then(({ body: { message } }) => {
          expect(message).to.equal('method not allowed');
        })
    })
    return Promise.all(methodPromises);
  });
  describe('GET', () => {
    it('GET /api serves a json object describing all api endpoints', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
          expect(body).to.contain.keys(
            'GET /api',
          )
        })
    });
  });
  describe('/api/topics', () => {
    describe('GET', () => {
      it('responds with status 200 and a list of all topics', () => {
        return request(app)
          .get('/api/topics')
          .expect(200)
          .then(({ body }) => {
            expect(body.topics[0]).to.have.all.keys(
              'description',
              'slug'
            );
            expect(body.topics).to.have.lengthOf(3)
          });
      });
    });
    it('ERROR 405 and a message when an invalid method is attempted', () => {
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
    describe('POST', () => {
      it('it returns 201 and the posted topic', () => {
        return request(app)
          .post('/api/topics')
          .send({
            slug: 'eggs',
            description: 'eggs chat'
          })
          .expect(201)
          .then(({ body: { topic } }) => {
            expect(topic).to.have.all.keys(
              'slug',
              'description'
            )
          })
      });
      it('it returns 201 and the posted topic even if there are extra props', () => {
        return request(app)
          .post('/api/topics')
          .send({
            slug: 'eggs',
            description: 'eggs chat',
            votes: 12,
            eggs: 1
          })
          .expect(201)
          .then(({ body: { topic } }) => {
            expect(topic).to.have.all.keys(
              'slug',
              'description'
            )
          })
      });
      it('ERROR 400 if posted without slug', () => {
        return request(app)
          .post('/api/topics')
          .send({
            description: 'eggs chat',
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT NULL VIOLATION');
          })
      });
      it('ERROR 400 if posted without description', () => {
        return request(app)
          .post('/api/topics')
          .send({
            slug: 'eggs',
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT NULL VIOLATION');
          })
      });
      it('ERROR 400 if posted with a non unique slug', () => {
        return request(app)
          .post('/api/topics')
          .send({
            slug: 'cats',
            description: 'eggs for days'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT UNIQUE');
          })
      });
    });
  });
  it('ERROR 404 and an error message when a request is made on an invalid route', () => {
    return request(app)
      .get('/api/not-a-route')
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).to.equal("route not found");
      })
  });
  describe('/api/users/:username', () => {
    describe('GET', () => {
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
      it('ERROR 404 when request is made with a non existant username', () => {
        return request(app)
          .get('/api/users/notauser')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('user not found');
          })
      });
    });
    it('ERROR 405 and a message when an invalid method is attempted', () => {
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
    describe('DELETE', () => {
      it('responds 204 no content', () => {
        return request(app)
          .delete('/api/articles/1')
          .expect(204);
      });
      it('ERROR 404 when trying to delete a nonexistant article_id', () => {
        return request(app)
          .delete('/api/articles/99991')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('article not found');
          });
      });
      it('ERROR 400 when trying to delete an invalid article_id', () => {
        return request(app)
          .delete('/api/articles/invalid')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID TEXT REPRESENTATION');
          });
      });
    });
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
            expect(+article.comment_count).to.equal(13);
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
            expect(+article.comment_count).to.equal(0);
          })
      })
      it('ERROR 404 with a message when request is made with a non existant article id', () => {
        return request(app)
          .get('/api/articles/99999')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('article not found');
          })
      });
      it('ERROR 400 and a message when requesting with an invalid article id', () => {
        return request(app)
          .get('/api/articles/invalid')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID TEXT REPRESENTATION');
          })
      });
    });
    describe('PATCH', () => {
      it('responds status 200 with the patched article', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 1 })
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
            )
            expect(article.votes).to.equal(101);
          });
      });
      it('ERROR 404 with a message when request is made with a non existant article id', () => {
        return request(app)
          .patch('/api/articles/99999')
          .send({ inc_votes: 1 })
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('article not found');
          })
      });
      it('ERROR 400 and a message when requesting with an invalid article id', () => {
        return request(app)
          .patch('/api/articles/invalid')
          .send({ inc_votes: 1 })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID TEXT REPRESENTATION');
          })
      });
      it('ERROR 400 and a message when request is made with an invalid vote increment', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 'a' })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID TEXT REPRESENTATION');
          })
      });
      it('ERROR 400 and a message when request is made with an invalid property', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ invalid_prop: 1 })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid request: inc_votes not found');
          })
      });
      it('ERROR 400 and a message when request is made without inc_votes', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({})
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid request: inc_votes not found');
          })
      });
      it('responds 200 ignores additional properties in the request', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({
            inc_votes: 1,
            legs: 12,
            author: 'huw'
          })
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
            )
            expect(article.votes).to.equal(101);
            expect(article.author).to.equal('butter_bridge');
          });
      });
    });
    it('ERROR 405 and a message when an invalid method is attempted', () => {
      const invalidMethods = ['put'];
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
  describe('/api/articles/:article_id/comments', () => {
    it('ERROR 405 method not allowed when a request is made with the wrong method', () => {
      const invalidMethods = ['put', 'delete', 'patch'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)[method]('/api/articles/1/comments')
          .expect(405)
          .then(({ body: { message } }) => {
            expect(message).to.equal('method not allowed');
          })
      })
      return Promise.all(methodPromises);
    });
    describe('POST', () => {
      it('returns 201 and the posted comment', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({
            username: 'butter_bridge',
            body: 'hello this is my first comment woop'
          })
          .expect(201)
          .then(({ body: { comment } }) => {
            expect(comment.body).to.equal('hello this is my first comment woop');
            expect(comment.author).to.equal('butter_bridge');
            expect(comment.article_id).to.equal(1);
            expect(comment).to.have.all.keys(
              'comment_id',
              'author',
              'article_id',
              'votes',
              'created_at',
              'body'
            )
          })
      });
      it('ERROR 400 when posted to a wrong format article_id', () => {
        return request(app)
          .post('/api/articles/dog/comments')
          .send({
            username: 'butter_bridge',
            body: 'woo a comment'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID TEXT REPRESENTATION');
          })
      });
      it('ERROR 404 when posted a comment citing a non existant article_id', () => {
        return request(app)
          .post('/api/articles/999099/comments')
          .send({
            username: 'butter_bridge',
            body: 'woo a comment'
          })
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('FOREIGN KEY VIOLATION');
          })
      });
      it('ERROR 400 when posted a comment without a username', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({
            body: 'woo a comment'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT NULL VIOLATION');
          })
      });
      it('ERROR 400 when posted a comment without a body', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({
            username: 'butter_bridge'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT NULL VIOLATION');
          })
      });
      it('ERROR 400 when posted a comment to a user who doesnt exist', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({
            username: 'huw',
            body: 'woop a comment woo'
          })
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('FOREIGN KEY VIOLATION');
          })
      });
      it('returns 201 and the posted comment and ignores any extra legitimate props posted', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({
            username: 'butter_bridge',
            body: 'hello this is my first comment woop',
            votes: 9999999
          })
          .expect(201)
          .then(({ body: { comment } }) => {
            expect(comment.body).to.equal('hello this is my first comment woop');
            expect(comment.author).to.equal('butter_bridge');
            expect(comment.article_id).to.equal(1);
            expect(comment).to.have.all.keys(
              'comment_id',
              'author',
              'article_id',
              'votes',
              'created_at',
              'body'
            )
            expect(comment.votes).to.equal(0);
          })
      });
      it('returns 201 and the posted comment and ignores any extra invalid props posted', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({
            username: 'butter_bridge',
            body: 'hello this is my first comment woop',
            legs: '6'
          })
          .expect(201)
          .then(({ body: { comment } }) => {
            expect(comment).to.have.all.keys(
              'comment_id',
              'author',
              'article_id',
              'votes',
              'created_at',
              'body'
            )
          })
      });
    });
    describe('GET', () => {
      it('responds 200 and an array of comments', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body: { comments, totalCount } }) => {
            expect(totalCount).to.equal(13);
            expect(comments[0]).to.have.all.keys(
              'comment_id',
              'votes',
              'created_at',
              'author',
              'body'
            );
          })
      });
      it('responds 200 and an empty array when passed an existing article_id which has no comments', () => {
        return request(app)
          .get('/api/articles/2/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.eql([]);
          })
      });
      describe('takes sort_by and order queries which...', () => {
        it('sorts by created_at and descending order by default', () => {
          return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments).to.be.descendingBy('created_at');
            })
        });
        it('sorts by comment id', () => {
          return request(app)
            .get('/api/articles/1/comments?sort_by=comment_id')
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments).to.be.descendingBy('comment_id');
            })
        });
        it('sorts by votes', () => {
          return request(app)
            .get('/api/articles/1/comments?sort_by=votes')
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments).to.be.descendingBy('votes');
            })
        });
        it('sorts by author', () => {
          return request(app)
            .get('/api/articles/1/comments?sort_by=author')
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments).to.be.descendingBy('author');
            })
        });
        it('orders by asc when set', () => {
          return request(app)
            .get('/api/articles/1/comments?order=asc')
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments).to.be.ascendingBy('created_at');
            })
        });
        it('can apply both sort_by and order at once', () => {
          return request(app)
            .get('/api/articles/1/comments?order=asc&sort_by=votes')
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments).to.be.ascendingBy('votes');
            })
        });
      });
      it('ERROR 400 when requesting to a wrong format article_id', () => {
        return request(app)
          .get('/api/articles/dog/comments')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID TEXT REPRESENTATION');
          })
      });
      it('ERROR 404 when requesting comments citing a non existant article_id', () => {
        return request(app)
          .get('/api/articles/999099/comments')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('article_id not found');
          })
      });
      it('returns 200 when requesting comments using a query that does not exist', () => {
        return request(app)
          .get('/api/articles/1/comments?dogs=2')
          .expect(200)
          .then(({ body: { comments, totalCount } }) => {
            expect(totalCount).to.equal(13);
            expect(comments[0]).to.have.all.keys(
              'comment_id',
              'votes',
              'created_at',
              'author',
              'body'
            );
          })
      });
      it('ERROR 400 when requesting comments using an order query not equal to asc or desc', () => {
        return request(app)
          .get('/api/articles/1/comments?order=invalidorder')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid query');
          })
      });
      it('ERROR 400 when requesting comments using an sort_by query specifying an invalid column', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=notacolumn')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('UNDEFINED COLUMN');
          })
      });
      it('can take a limit query', () => {
        return request(app)
          .get('/api/articles/1/comments?limit=5')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.have.lengthOf(5);
          })
      });
      it('can take a limit query which is defaulted to 10', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.have.lengthOf(10);
          })
      });
      it('can take a p query which will return specific pages', () => {
        return request(app)
          .get('/api/articles/1/comments?p=2')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.have.lengthOf(3)
          })
      });
      it('can take a p query which will return return page 1 by deafult', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.have.lengthOf(10);
          })
      });
      it('ERROR 400 when limit is passed in an invalid format', () => {
        return request(app)
          .get('/api/articles/1/comments?limit=invalidFormat')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID LIMIT VALUE');
          })
      });
      it('ERROR 400 when limit is passed in as a number less than 0', () => {
        return request(app)
          .get('/api/articles/1/comments?limit=-1')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID LIMIT VALUE');
          })
      });
      it('ERROR 400 when P is passed in as a number less than 1', () => {
        return request(app)
          .get('/api/articles/1/comments?p=0')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID PAGE NUMBER');
          })
      });
      it('ERROR 400 when P is passed in in an invalid format', () => {
        return request(app)
          .get('/api/articles/1/comments?p=dog')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID PAGE NUMBER');
          })
      });
    });
  });
  describe('/api/articles', () => {
    it('ERROR 405 when request made wtih invalid method', () => {
      const invalidMethods = ['put', 'delete', 'patch'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)[method]('/api/articles')
          .expect(405)
          .then(({ body: { message } }) => {
            expect(message).to.equal('method not allowed');
          })
      })
      return Promise.all(methodPromises);
    });
    describe('GET', () => {
      it('responds 200 with an array of articles', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles, totalCount } }) => {
            expect(totalCount).to.equal(12);
            expect(articles[0]).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'topic',
              'created_at',
              'votes',
              'comment_count'
            );
          })
      });
      describe('can take a sort_by, order, author and topic queries which...', () => {
        it('sorts by created_at and descending order by default', () => {
          return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles).to.descendingBy('created_at');
            })
        });
        it('sorts by author', () => {
          return request(app)
            .get('/api/articles?sort_by=author')
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles).to.descendingBy('author');
            })
        });
        it('sorts by title', () => {
          return request(app)
            .get('/api/articles?sort_by=title')
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles).to.descendingBy('title');
            })
        });
        it('sorts by article_id', () => {
          return request(app)
            .get('/api/articles?sort_by=article_id')
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles).to.descendingBy('article_id');
            })
        });
        it('sorts by topic', () => {
          return request(app)
            .get('/api/articles?sort_by=topic')
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles).to.descendingBy('topic');
            })
        });
        it('sorts by votes', () => {
          return request(app)
            .get('/api/articles?sort_by=votes')
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles).to.descendingBy('votes');
            })
        });
        it('can be ordered by ascending', () => {
          return request(app)
            .get('/api/articles?order=asc')
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles).to.ascendingBy('created_at');
            })
        });
        it('can be ordered by ascending and sorted by another column', () => {
          return request(app)
            .get('/api/articles?order=asc&sort_by=votes')
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles).to.ascendingBy('votes');
            })
        });
        it('can retrieve only articles by certain authors', () => {
          return request(app)
            .get('/api/articles?author=butter_bridge')
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles).to.have.lengthOf(3);
              expect(articles.every(article => article.author === 'butter_bridge')).to.be.true;
            })
        });
        it('can retrieve only articles on certain topics', () => {
          return request(app)
            .get('/api/articles?topic=mitch')
            .expect(200)
            .then(({ body: { articles, totalCount } }) => {
              expect(totalCount).to.equal(11);
              expect(articles.every(article => article.topic === 'mitch')).to.be.true;
            })
        });
        it('can handle all these queries together', () => {
          return request(app)
            .get('/api/articles?topic=mitch&author=icellusedkars&sort_by=votes&order=asc')
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles).to.have.lengthOf(6);
              expect(articles).to.be.ascendingBy('votes');
              expect(articles.every(article => article.topic === 'mitch' && article.author === 'icellusedkars')).to.be.true;
            })
        });
      });
      it('ERROR 400 when attempting to sort by a non column', () => {
        return request(app)
          .get('/api/articles?sort_by=notAcolumn')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('UNDEFINED COLUMN');
          })
      });
      it('ERROR 400 when attempting to set order to something other than asc or desc', () => {
        return request(app)
          .get('/api/articles?order=invalidorder')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid query');
          })
      });
      it('ERROR 404 when attempting to filter by an author than doesnt exist', () => {
        return request(app)
          .get('/api/articles?author=huw')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('not found');
          })
      });
      it('ERROR 404 when attempting to filter by an topic than doesnt exist', () => {
        return request(app)
          .get('/api/articles?topic=notatopic')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('not found');
          })
      });
      it('responds 200 and an empty array when attempting to filter by an author has no articles', () => {
        return request(app)
          .get('/api/articles?author=lurker')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.eql([]);
          })
      });
      it('ERROR 200 and an empty array when attempting to filter by an topic has no articles', () => {
        return request(app)
          .get('/api/articles?topic=paper')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.eql([]);
          })
      });
      it('responds 200 with an array of articles when passed an invalid query', () => {
        return request(app)
          .get('/api/articles?dogs=2')
          .expect(200)
          .then(({ body: { articles, totalCount } }) => {
            expect(totalCount).to.equal(12);
            expect(articles[0]).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'topic',
              'created_at',
              'votes',
              'comment_count',

            );
          })
      });
      it('responds 200 with an array of sorted or otherwise queried articles when request made with several valid queries and an invalid query ', () => {
        return request(app)
          .get('/api/articles?author=icellusedkars&topic=mitch&dogs=2&order=asc&sort_by=article_id')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.have.lengthOf(6);
            expect(articles).to.be.ascendingBy('article_id');
            expect(articles.every(article => article.author === 'icellusedkars' && article.topic === 'mitch')).to.be.true;
            expect(articles[0]).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'topic',
              'created_at',
              'votes',
              'comment_count'
            );
          })
      });
      it('can take a limit query', () => {
        return request(app)
          .get('/api/articles?limit=5')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.have.lengthOf(5);
          })
      });
      it('can take a limit query which is defaulted to 10', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.have.lengthOf(10);
          })
      });
      it('can take a p query which will return specific pages', () => {
        return request(app)
          .get('/api/articles?p=2')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles[0].article_id).to.equal(11);
          })
      });
      it('can take a p query which will return return page 1 by deafult', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles[0].article_id).to.equal(1);
          })
      });
      it('ERROR 400 when limit is passed in an invalid format', () => {
        return request(app)
          .get('/api/articles?limit=invalidFormat')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID LIMIT VALUE');
          })
      });
      it('ERROR 400 when limit is passed in as a number less than 0', () => {
        return request(app)
          .get('/api/articles?limit=-1')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID LIMIT VALUE');
          })
      });
      it('ERROR 400 when P is passed in as a number less than 1', () => {
        return request(app)
          .get('/api/articles?p=0')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID PAGE NUMBER');
          })
      });
      it('ERROR 400 when P is passed in in an invalid format', () => {
        return request(app)
          .get('/api/articles?p=dog')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID PAGE NUMBER');
          })
      });
    });
    describe('POST', () => {
      it('responds 201 and the posted article', () => {
        return request(app)
          .post('/api/articles')
          .send({
            title: 'a fun title',
            body: 'woooo look at this article body',
            topic: 'mitch',
            author: 'butter_bridge'
          })
          .expect(201)
          .then(({ body: { article } }) => {
            expect(article).to.have.all.keys(
              'title',
              'body',
              'topic',
              'author',
              'article_id',
              'votes',
              'created_at'
            );
            expect(article.title).to.equal('a fun title');
            expect(article.body).to.equal('woooo look at this article body');
            expect(article.topic).to.equal('mitch');
            expect(article.author).to.equal('butter_bridge');
          })
      });
      it('responds 201 and the posted article even if extra keys are supplied; they are ignored', () => {
        return request(app)
          .post('/api/articles')
          .send({
            title: 'a fun title',
            body: 'woooo look at this article body',
            topic: 'mitch',
            author: 'butter_bridge',
            legs: '2',
            eggs: 1
          })
          .expect(201)
          .then(({ body: { article } }) => {
            expect(article).to.have.all.keys(
              'title',
              'body',
              'topic',
              'author',
              'article_id',
              'votes',
              'created_at',
            );
          })
      });
      it('responds 201 and the posted article and default keys are not overwritten if supplied in the post', () => {
        return request(app)
          .post('/api/articles')
          .send({
            title: 'a fun title',
            body: 'woooo look at this article body',
            topic: 'mitch',
            author: 'butter_bridge',
            created_at: 91514879925,
            votes: 22
          })
          .expect(201)
          .then(({ body: { article } }) => {
            expect(article).to.have.all.keys(
              'title',
              'body',
              'topic',
              'author',
              'article_id',
              'votes',
              'created_at'
            );
            expect(article.votes).to.equal(0);
            expect(article.created_at).to.not.equal(new Date(91514879925));
          })
      });
      it('ERROR 404 if posted with a non existant author', () => {
        return request(app)
          .post('/api/articles')
          .send({
            title: 'a fun title',
            body: 'woooo look at this article body',
            topic: 'mitch',
            author: 'invalidAUTHOR',
          })
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('FOREIGN KEY VIOLATION')
          })
      });
      it('ERROR 404 if posted with a non existant topic', () => {
        return request(app)
          .post('/api/articles')
          .send({
            title: 'a fun title',
            body: 'woooo look at this article body',
            topic: 'NOTATOPIC',
            author: 'butter_bridge',
          })
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('FOREIGN KEY VIOLATION')
          })
      });
      it('ERROR 400 if posted without topic', () => {
        return request(app)
          .post('/api/articles')
          .send({
            title: 'a fun title',
            body: 'woooo look at this article body',
            author: 'butter_bridge',
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT NULL VIOLATION')
          })
      });
      it('ERROR 400 if posted without author', () => {
        return request(app)
          .post('/api/articles')
          .send({
            topic: 'mitch',
            title: 'a fun title',
            body: 'woooo look at this article body',
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT NULL VIOLATION')
          })
      });
      it('ERROR 400 if posted without title', () => {
        return request(app)
          .post('/api/articles')
          .send({
            topic: 'mitch',
            body: 'woooo look at this article body',
            author: 'butter_bridge',
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT NULL VIOLATION')
          })
      });
      it('ERROR 400 if posted without body', () => {
        return request(app)
          .post('/api/articles')
          .send({
            topic: 'mitch',
            title: 'eggs',
            author: 'butter_bridge',
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT NULL VIOLATION')
          })
      });
    });
  });
  describe('/api/comments/:comment_id', () => {
    it('ERROR 405 when request made wtih invalid method', () => {
      const invalidMethods = ['put', 'get', 'post'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)[method]('/api/comments/1')
          .expect(405)
          .then(({ body: { message } }) => {
            expect(message).to.equal('method not allowed');
          })
      })
      return Promise.all(methodPromises);
    });
    describe('PATCH', () => {
      it('responds 200 with the updated comment', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            inc_votes: 10
          })
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment.votes).to.equal(26)
            expect(comment).to.have.all.keys(
              'body',
              'comment_id',
              'article_id',
              'author',
              'created_at',
              'votes'
            );
          })
      });
      it('ERROR 404 when trying requesting to non existant comment id', () => {
        return request(app)
          .patch('/api/comments/999090909')
          .send({
            inc_votes: 10
          })
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('comment not found');
          })
      });
      it('ERROR 400 when trying requesting to an invalid comment id', () => {
        return request(app)
          .patch('/api/comments/invalid_id')
          .send({
            inc_votes: 10
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID TEXT REPRESENTATION');
          })
      });
      it('ERROR 400 when sending an invalid vote_inc', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            inc_votes: 'not an integer'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID TEXT REPRESENTATION');
          })
      });
      it('ERROR 400 when sending nothing', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({})
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid request: inc_votes not found');
          })
      });
      it('ERROR 400 when sending a request without inc_votes but with some other prop', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            body: 'a body to be ignored'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid request: inc_votes not found');
          })
      });
      it('responds 200 with the updated comment when post request is supplied with inc_votes and another property; the irrelevent property will be ignored', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            inc_votes: 10,
            body: 'a body to be ignored',
            legs: 2
          })
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment.votes).to.equal(26)
            expect(comment).to.have.all.keys(
              'body',
              'comment_id',
              'article_id',
              'author',
              'created_at',
              'votes'
            );
            expect(comment.body).to.not.equal('a body to be ignored');
          })
      });
    });
    describe('DELETE', () => {
      it('responds 204 and no content', () => {
        return request(app)
          .delete('/api/comments/1')
          .expect(204);
      });
      it('ERROR 404 comment not found if request made to non existant comment', () => {
        return request(app)
          .delete('/api/comments/9876545')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('comment not found');
          })
      });
      it('ERROR 400 comment not found if request made to an invalid comment', () => {
        return request(app)
          .delete('/api/comments/invalid_comment_id')
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID TEXT REPRESENTATION');
          })
      });
    });
  });
  describe('/api/users', () => {
    it('ERROR 405 and a message when an invalid method is attempted', () => {
      const invalidMethods = ['patch', 'put', 'delete'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)[method]('/api/users')
          .expect(405)
          .then(({ body: { message } }) => {
            expect(message).to.equal('method not allowed');
          })
      })
      return Promise.all(methodPromises);
    });
    describe('GET', () => {
      it('responds with status 200 and a list of all users', () => {
        return request(app)
          .get('/api/users')
          .expect(200)
          .then(({ body: { users } }) => {
            expect(users[0]).to.have.all.keys(
              'username',
              'avatar_url',
              'name'
            );
            expect(users).to.have.lengthOf(4);
          });
      });
    });
    describe('POST', () => {
      it('responds 201 with the posted user object', () => {
        return request(app)
          .post('/api/users')
          .send({
            username: 'huw',
            avatar_url: 'https://avatars2.githubusercontent.com/u/24394918?s=400&v=5',
            name: 'huw j'
          })
          .expect(201)
          .then(({ body: { user } }) => {
            expect(user).to.have.all.keys(
              'username',
              'avatar_url',
              'name'
            )
          });
      });
      it('reponds 201 with the posted user when posted extra keys', () => {
        return request(app)
          .post('/api/users')
          .send({
            username: 'huw',
            avatar_url: 'https://avatars2.githubusercontent.com/u/24394918?s=400&v=5',
            name: 'huw j',
            votes: 1,
            legs: 6
          })
          .expect(201)
          .then(({ body: { user } }) => {
            expect(user).to.have.all.keys(
              'username',
              'avatar_url',
              'name'
            )
          });
      });
      it('responds 201 with thr posted user including a default avatar_url if one if not posted', () => {
        return request(app)
          .post('/api/users')
          .send({
            username: 'huw',
            name: 'huw j'
          })
          .expect(201)
          .then(({ body: { user } }) => {
            expect(user).to.have.all.keys(
              'username',
              'avatar_url',
              'name'
            )
            expect(user.avatar_url).to.equal('https://avatars2.githubusercontent.com/u/24394918?s=400&v=1')
          });
      });
      it('ERROR 400 if no username supplied', () => {
        return request(app)
          .post('/api/users')
          .send({
            name: 'huw j'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT NULL VIOLATION');
          });
      });
      it('ERROR 400 if no name supplied', () => {
        return request(app)
          .post('/api/users')
          .send({
            username: 'huw'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT NULL VIOLATION');
          });
      });
      it('ERROR 400 if username already exists', () => {
        return request(app)
          .post('/api/users')
          .send({
            username: 'butter_bridge',
            name: 'huw'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('NOT UNIQUE');
          });
      });
      it('ERROR 400 if avatar_url not an url', () => {
        return request(app)
          .post('/api/users')
          .send({
            username: 'huw',
            name: 'huw',
            avatar_url: 6
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('INVALID AVATAR URL');
          });
      });
    });
  });
});
