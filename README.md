# NorthCoders News API

## Description

This is an API for interacting with my Northcoders news app. The database is PSQL and interactions are made using K'nex. The news app itself consists of tables for differnt topics, users, articles and comments and various endpoints are available for interaction with these tables.

## Link 

[Link to my version of the app hosted on heroku.](https://nc-news-huw.herokuapp.com/api)

## Cloning and installing

* First, clone the repo:
  ```bash
    git clone https://github.com/huw121/NC-News.git

    cd NC-News
  ```
* On GitHub if you want your own repository for this project go ahead and set that up before running:
  ```bash
    git remote remove origin

    git remote add origin <YOUR-GITHUB-URL>
  ```

* The following dependencies are provided for you:

  * [express ^4.17.1](https://expressjs.com/en/api.html)
  * [knex ^0.19.0](https://knexjs.org/)
  * [pg ^7.11.0](https://node-postgres.com/)

  So you can go ahead and run
  ```bash
    npm install
  ```

* There is one other file you're going to need to create yourself before we can start creating and seeding our databases. So first you need a new file in the root directory called exactly 'knexfile.js'. The content of this file should look as follows:

  **If this is your first time using psql please first refer to psql-setup.md**

  ```js
  const ENV = process.env.NODE_ENV || 'development';
  const { DB_URL } = process.env;

  const baseConfig = {
    client: 'pg',
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    },
    migrations: {
      directory: './db/migrations'
    }
  };

  const customConfig = {
    production: {
      connection: `${DB_URL}?ssl=true`
    },
    development: {
      connection: {
        database: 'nc_news',
        user: '<YOUR-PG-USERNAME-HERE>', // LINUX ONLY
        password: '<YOUR-PG-PASSWORD-HERE>' // LINUX ONLY
      }
    },
    test: {
      connection: {
        database: 'nc_news_test',
        user: '<YOUR-PG-USERNAME-HERE>', // LINUX ONLY
        password: '<YOUR-PG-PASSWORD-HERE>' // LINUX ONLY
      }
    }
  };

  module.exports = { ...customConfig[ENV], ...baseConfig };
  ```

## Setting up and seeding databases

* Once those dependencies have been installed we can go ahead and setup our databases:
  ```bash
    npm run setup-dbs
  ```
* You now will have both development and test databases. Now to add all of our tables on our development and test databases respectively you can run:
  ```bash
    npm run migrate-latest

    npm run migrate-latest-test
  ```
* You have two sets of data in the data folder. To populate your development and test databases respectively with this data you can run:
  ```bash
    npm run seed
    
    npm run seed-test
  ```
  Okay, great! You should now have two databases complete with tables and data.

## Testing

* If you want to run the existing tests you will firsts need the follwing developer dependencies:

  * [chai ^4.2.0](https://www.chaijs.com/api/bdd/)
  * [chai-sorted ^0.2.0](https://www.npmjs.com/package/chai-sorted)
  * [mocha ^6.1.4](https://mochajs.org/)
  * [supertest ^4.0.2](https://www.npmjs.com/package/supertest)

  ```bash
    npm install chai chai-sorted mocha supertest -D
  ```

* To run the tests you have the follwing existing scripts:
  * To run the app.js tests:
  ```bash
    npm test
  ```
  * To run the tests for the function found in db/utils:
  ```bash
    npm run test-utils
  ```
  * To run all tests together:
  ```bash
    npm run all-tests
  ```
* For visual testing I also used nodemon which can be installed by running:
  ```bash
    npm install nodemon -D
  ```
  and can be run using:
  ```bash
    npm run dev
  ```
## Other scripts
* If you make changes and need to rollback your migrations you have the following available:
  ```bash
    npm run migrate-rollback

    npm run migrate-rollback-test

    npm runmigrate-down-up
  ```
## Hosting
  There are a couple of previously unlisted scripts available to you that have been created specifically for hosting:

  * To start your server (needed if hosting - see below):
  ```bash
    npm start
  ```
  * To seed a production database:
  ```bash
    npm run seed:prod
  ```
  Please see hosting.md for instructions on hosting your app and database on heroku.

## Current Endpoints

  * /api
    * GET
      * Serves up a json representation of all the available endpoints of the api.
  * /api/topics
    * GET
      * Serves an array of all topics:
        ```js
          [
        {
        "slug": "football",
        "description": "Footie!"
        }
          ]
        ```
  * /api/artciles
    * GET
      * Serves an array of all articles and can take queries of author, topic, sort_by and order:
        ```js
          [
        {
        "title": "Seafood substitutions are increasing",
        "topic": "cooking",
        "author": "weegembump",
        "body": "Text from the article..",
        "created_at": 1527695953341
        }
          ]
        ```
  * /api/users/:username
    * GET
      * A parametric endpoint of username serves a corresponing user object:
        ```js
        {
        "username": "tickle122",
        "avatar_url": "https://www.spiritsurfers.net/monastery/wp-content/uploads/_41500270_mrtickle.jpg",
        "name": "Tom Tickle"
        }
        ```
  * /api/articles/:article_id
    * GET
      * A parametric endpoint of article_id serves a corresponding article object:
        ```js
        {
        "article_id": 1,
        "title": "Running a Node App",
        "body": "This is part two of a series on how to get up and running with Systemd and Node.js. This part dives deeper into how to successfully run your app with systemd long-term, and how to set it up in a production environment.",
        "votes": 44,
        "topic": "coding",
        "author": "jessjelly",
        "created_at": "2016-08-18T12:07:52.389Z",
        "comment_count": "8"
        }
        ```
    * PATCH
      * A parametric endpoint of article_id used for altering votes of specified article. Returns patched article:
        ```js
        // example request body:
        {
        "inc_votes": 1
        }
        // example response:
        {
        "article_id": 1,
        "title": "Running a Node App",
        "body": "This is part two of a series on how to get up and running with Systemd and Node.js. This part dives deeper into how to successfully run your app with systemd long-term, and how to set it up in a production environment.",
        "votes": 46,
        "topic": "coding",
        "author": "jessjelly",
        "created_at": "2016-08-18T12:07:52.389Z"
        }
        ```
  * /api/articles/:article_id/comments
    * GET
      * A parametric endpoint with an article_id serving an array of all comments relating to referenced article:
        ```js
          [
        {
          "votes": 4,
          "author": "grumpy19",
          "created_at": "2017-11-20T08:58:48.322Z",
          "comment_id": 44,
          "body": "Error est qui id corrupti et quod enim accusantium minus. Deleniti quae ea magni officiis et qui suscipit non."
        },
        {
          "votes": 10,
          "author": "jessjelly",
          "created_at": "2017-07-31T08:14:13.076Z",
          "comment_id": 52,
          "body": "Consectetur deleniti sed. Omnis et dolore omnis aspernatur. Et porro accusantium. Tempora ullam voluptatum et rerum."
        }
         ]
        ```
    * POST
      * A parametric endpoint enabling posting of comments relating to specific articles. Responds with the posted comment object
        ```js
        // example request body
        {
        "username": "butter_bridge",
        "body": "hello this is my first comment woop"
        }
        // example response
        "comment": {
        "comment_id": 301,
        "author": "tickle122",
        "article_id": 1,
        "votes": 0,
        "created_at": "2019-07-17T15:48:30.049Z",
        "body": "hello this is my first comment woop"
        }
        ```
  * /api/comments/comments_id:
    * PATCH
      * A parametric endpoint for changing comment vote count. Responds with updated comment object:
        ```js
        // example request body:
        {
        "inv_votes": 4
        } 
        // example response
        {
        "comment_id": 1,
        "author": "tickle122",
        "article_id": 18,
        "votes": 9,
        "created_at": "2016-07-09T18:07:18.932Z",
        "body": "Itaque quisquam est similique et est perspiciatis reprehenderit voluptatem autem. Voluptatem accusantium eius error adipisci quibusdam doloribus."
        }
        ```
    * DELETE
      * A parametric endpoint for deleting comments by their id. Responds 204 no content upon succefful deletion.
  
## Author
  ### Huw Jones
## Acknowledgments
  ### NorthCoders