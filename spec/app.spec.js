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
            expect(message).to.equal('invalid input syntax for integer: "invalid"');
          })
      });
      it('ERROR 400 and a message when request is made with an invalid vote increment', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 'a' })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('invalid input syntax for integer: "NaN"');
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
    it('ERROR 405 and a message when an invalid method is attempted', () => {
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
            expect(message).to.equal('invalid input syntax for integer: "dog"');
          })
      });
      it('ERROR 400 when posted a comment citing a non existant article_id', () => {
        return request(app)
          .post('/api/articles/999099/comments')
          .send({
            username: 'butter_bridge',
            body: 'woo a comment'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('insert or update on table "comments" violates foreign key constraint "comments_article_id_foreign"');
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
            expect(message).to.equal('null value in column "author" violates not-null constraint');
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
            expect(message).to.equal('null value in column "body" violates not-null constraint');
          })
      });
      it('ERROR 400 when posted a comment to a user who doesnt exist', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({
            username: 'huw',
            body: 'woop a comment woo'
          })
          .expect(400)
          .then(({ body: { message } }) => {
            expect(message).to.equal('insert or update on table "comments" violates foreign key constraint "comments_author_foreign"');
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
          .then(({ body: { comments } }) => {
            expect(comments).to.have.lengthOf(13);
            expect(comments[0]).to.have.all.keys(
              'comment_id',
              'votes',
              'created_at',
              'author',
              'body'
            );
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
            expect(message).to.equal('invalid input syntax for integer: "dog"');
          })
      });
      it('ERROR 404 when requesting comments citing a non existant article_id', () => {
        return request(app)
          .get('/api/articles/999099/comments')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('not found');
          })
      });
      it('returns 200 when requesting comments using a query that does not exist', () => {
        return request(app)
          .get('/api/articles/1/comments?dogs=2')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.have.lengthOf(13);
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
            expect(message).to.equal('column "notacolumn" does not exist');
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
          .then(({ body: { articles } }) => {
            expect(articles).to.have.lengthOf(12);
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
            .then(({ body: { articles } }) => {
              expect(articles).to.have.lengthOf(11);
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
            expect(message).to.equal('column "notAcolumn" does not exist');
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
      it('ERROR 404 when attempting to filter by an author has no articles', () => {
        return request(app)
          .get('/api/articles?author=lurker')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('not found');
          })
      });
      it('ERROR 404 when attempting to filter by an topic has no articles', () => {
        return request(app)
          .get('/api/articles?topic=paper')
          .expect(404)
          .then(({ body: { message } }) => {
            expect(message).to.equal('not found');
          })
      });
      it('responds 200 with an array of articles when passed an invalid query', () => {
        return request(app)
          .get('/api/articles?dogs=2')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.have.lengthOf(12);
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
      it('responds 201 with the updated comment', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            inc_votes: 10
          })
          .expect(201)
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
          .then(({body: {message}}) => {
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
          .then(({body: {message}}) => {
            expect(message).to.equal('invalid input syntax for integer: "invalid_id"');
          })
      });
      it('ERROR 400 when sending an invalid vote_inc', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            inc_votes: 'not an integer'
          })
          .expect(400)
          .then(({body: {message}}) => {
            expect(message).to.equal('invalid input syntax for integer: "NaN"');
          })
      });
      it('ERROR 400 when sending nothing', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({})
          .expect(400)
          .then(({body: {message}}) => {
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
          .then(({body: {message}}) => {
            expect(message).to.equal('invalid request: inc_votes not found');
          })
      });
      it('responds 201 with the updated comment when post request is supplied with inc_votes and another property; the irrelevent property will be ignored', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            inc_votes: 10,
            body: 'a body to be ignored',
            legs: 2
          })
          .expect(201)
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
          .then(({body: {message}}) => {
            expect(message).to.equal('comment not found');
          })
      });
      it('ERROR 400 comment not found if request made to an invalid comment', () => {
        return request(app)
          .delete('/api/comments/invalid_comment_id')
          .expect(400)
          .then(({body: {message}}) => {
            expect(message).to.equal('invalid input syntax for integer: "invalid_comment_id"');
          })
      });
    });
  });
});
