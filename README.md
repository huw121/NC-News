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
  For a full list of endpoints including example requests and responses please [click here](https://nc-news-huw.herokuapp.com/api)
  
## Author
  ### Huw Jones
## Acknowledgments
  ### NorthCoders