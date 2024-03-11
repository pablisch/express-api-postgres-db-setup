# Express API with PostgreSQL Database setup

This project is simply to outline the processes involved in setting up an Express API with a PostgreSQL database.

Code files included are purely intended as a comprehenisve example of the instructions provided in this README.md file.

The order in which the API and database are made are optional. These instructions provide one possible order.

The details of both the API and database obviously depend on the specific requirements of the project but for the sake of an example, this will be in the form of a simple to-do list project.

## Contents

1. [Setting up the repository](#setting-up-the-repository)
2. [Setting up the database](#setting-up-the-database)
3. [Prepare for using the database in the API](#prepare-for-using-the-database-in-the-api)
4. [Server 1 - Basic Server Setup](#server-1---basic-server-setup)
5. [Server 2 - Middleware and First Route](#server-2---middleware-and-first-route)
6. [GET /todos 1 - First Todo Route](#get-todos-1---first-todo-route)
7. [GET /todos 2 - Refactor the todo route](#get-todos-2---refactor-the-todo-route)
8. [GET /todos 3 - Add the first controller function unit test](#get-todos-3---add-the-first-controller-function-unit-test)
9. [GET /todos/:id 1 - Basic getTodoById controller function and unit test](#get-todosid-1---basic-gettodobyid-controller-function-and-unit-test)
10. [GET /todos/:id 1 - Add error handling to getTodoById controller function](#get-todosid-1---add-error-handling-to-gettodobyid-controller-function)

## Setting up the repository

Create a local directory for the project and navigate to it in the terminal. 
Initialise npm and git, install dependencies and dev dependencies, and create the required folders and files.
```
npm init -y
git init
npm i express dotenv pg
npm i -D nodemon jest supertest
mkdir controllers routes utils
touch .env .gitignore server.js app.js app.test.js db.js seeds.sql tables.sql utils/reset-db-data.js routes/todoRoutes.js controllers/todoController.js controllers/todoController.test.js
```
Add required file exemptions to .gitignore, e.g.
```
node_modules
.DS_Store
.env
```

## Setting up the database

Assuming that PostgreSQL is installed, create a database and a user with the required permissions.
```
createdb todolist
```

### Set up tables

In the tables.sql file, create the required tables for the project. For example:
```
DROP TABLE IF EXISTS todos;

CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  task VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false
);

-- psql -h 127.0.0.1 todolist < tables.sql
-- psql -h 127.0.0.1 todolist < seeds.sql
```

The last two lines of this are the commented out commands to run the tables.sql and seeds.sql files in the terminal.

### Set up seeds

In the seeds.sql file, add some initial data to the tables. For example:
```
TRUNCATE TABLE todos RESTART IDENTITY CASCADE;

INSERT INTO todos (task, completed) VALUES
('Eat', true),
('Sleep', false),
('Pray', false)
;

-- psql -h 127.0.0.1 todolist < tables.sql
-- psql -h 127.0.0.1 todolist < seeds.sql
```

### Create and seed the database tables

In the terminal, run the following commands to create and seed the database tables:
```
psql -h 127.0.0.1 todolist < tables.sql
psql -h 127.0.0.1 todolist < seeds.sql
```

## Prepare for using the database in the API

### Setup environment variables

In the .env file, add the environment variables required for the database connection. For example:
```
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Setup database connection

In the db.js file, create a connection to the PostgreSQL database. For example:
```
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'todolist',
  host: 'localhost',
  port: 5432
})

module.exports = pool;
```

### Write a function to reset the database data

In the utils/resetDbData.js file, write a function to reset the database data. For example:
```
const pool = require('../db');

const resetDbData = async () => {
  const resetQuery = `
    TRUNCATE TABLE todos RESTART IDENTITY CASCADE;

    INSERT INTO todos (task, completed) VALUES
    ('Eat', true),
    ('Sleep', false),
    ('Pray', false);
  `;

  try {
    await pool.query(resetQuery);
  } catch (error) {
    console.log('Error resetting database', error);
    throw error;
  }
};

module.exports = resetDbData;
```

## Server 1 - Basic Server Setup

### Setup the basic server

In the app.js file, create the Express server and set up the required middleware. For example:
```javascript
const express = require('express');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

module.exports = app;
```

In the server.js file, start the server. For example:
```javascript
const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Write scripts for starting the server and running tests

In the package.json file, add the following scripts:
```
"scripts": {
  "start": "node server.js",
  "test": "jest --watchAll --detectOpenHandles"
}
```

### Start the server

```bash
npm start
```

## Server 2 - Middleware and First Route

### Add middleware to app.js

Add middleware to app.js to parse JSON and handle errors, below where the app is created.

```javascript
app.use(express.json());

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message });
});
```

### Create the first route

Add a simple home route **after** the `json` middleware and **before** the error handling middleware in app.js.

```javascript
app.get('/', (req, res, next) => {
  try {
    res.status(200).json({message: "Home endpoint is working!"})
  } catch (error) {
    next (error);
  }
});
```

### Manually test the first route

This can be tested in the browser or using a tool like Postman by making a `GET` request to `http://localhost:3000/`.

**NOTE:** The server must be running for this to work.

## GET /todos 1 - First Todo Route and Integration Test

### Import pool into app.js

```javascript
const pool = require('./db');
```

### Create the todo route in app.js

In the app.js file, create the todo route. For example:
```javascript
app.get('/todos', async (req, res, next) => {
  const getAllTodosQuery = 'SELECT * from todos';

  try {
    const results = await pool.query(getAllTodosQuery);
    res.status(200).json(results.rows);
  } catch (error) {
    next(error);
  }
})
```

### Manually test the todo route

As before, in browser or Postman, make a `GET` request to `http://localhost:3000/todos`.

### Write an integration test for the todo route

In the app.test.js file, import `app`, `request` from `supertest` and the `resetDbData` function.

```javascript
const request = require('supertest');
const app = require('./app');
const resetDbData = require('./utils/resetDbData');
```

Start with an overarching `describe` block and a `beforeEach` block to reset the database data before each test.

```javascript
describe('App todo endpoint integration tests', () => {
  beforeEach(async () => {
    await resetDbData();
  });
})
```

Write a test for the `GET` request to `/todos` inside the overarching `describe` block.

```javascript
describe('GET /todos', () => {
    test('should return an array of all todos and status 200', async () => {
      // Act
      const response = await request(app).get('/todos');
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body[0].task).toBe('Eat');
      expect(response.body[1].completed).toBe(false);
    })
  })
```

**NOTE:** The exact tests you choose are fairly optional.

### Run the integration tests

```bash
npm test
```

## GET /todos 2 - Refactor the todo route into routes and controllers

This stage is all about moving the endpoint that was just written into specific route and controller files.

### Create the todo controller function

Import `pool` into the todoController.js file so that the controller function can access the database.

```javascript 
const pool = require('../db');
```

The logic for the todo route should be moved from `app.js` into the controller file, `todoController.js`, in the `controllers` folder.
```javascript
const getAllTodos = async (req, res, next) => {
  const getAllTodosQuery = 'SELECT * from todos';

  try {
    const results = await pool.query(getAllTodosQuery);
    res.status(200).json(results.rows);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTodos,
};
```

### Create the todo route

In the routes/todoRoutes.js file, import the express router and the todo controller, create the router, and export it:
```javascript
const { Router } = require('express');
const router = Router();

const { getAllTodos } = require('../controllers/todoController');

module.exports = router;
```

Betweeen the inports and export, add the first route:
```javascript
router.get('/', getAllTodos);
```

**NOTE:** The route is now just `/` as the `/todos` endpoint root is handled in the app.js file.

### Import and use the todo route into app.js

In the app.js file, import the todo route as `todoRoutes` with the other imports:
```javascript
const todoRoutes = require('./routes/todoRoutes');
```

Use`todoRoutes` between the single home route and the `next` error handling middleware:
```javascript
app.use('/todos', todoRoutes);
```

### Clean up old todo route code in app.js

Remove these snippets of old todo route from app.js:
```javascript
const pool = require('./db');
```
and
```javascript
app.get('/todos', async (req, res, next) => {
  const getAllTodosQuery = 'SELECT * from todos';

  try {
    const results = await pool.query(getAllTodosQuery);
    res.status(200).json(results.rows);
  } catch (error) {
    next(error);
  }
})
```
At this point, you could also remove the `home` route from app.js, whose purpose was only to test the server was working.

### Check app.test.js integration test still passes

The `app.js` file should now look ike this:
```javascript
const express = require('express');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

app.use(express.json());

app.use('/todos', todoRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message });
});

module.exports = app;
```

The `app.test.js` file test for the `/todos` route should still pass as should any manual test in the browser or Postman.

## GET /todos 3 - Unit testing the getAllTodos controller function

### import required files into the controller test file

Create a test file, `todoController.test.js`, in the `controllers` folder and import `getAllTodos` and `resetDbData`.

```javascript
const resetDbData = require('../utils/resetDbData');
const { getAllTodos } = require('./todoController');
```

### Set up over-arching `describe` block and `beforeEach` block

```javascript
describe('Todo routes controller functions unit tests', () => {

  beforeEach( async () => {
    await resetDbData();
  });
})
```

### Write a test for the `getAllTodos` function

```javascript
describe('getAllTodos()', () => {
    test('should return an array of all todo objects and status 200', async () => {
      // Arrange
      const mReq = {};
      const mRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      }
      const mNext = jest.fn();

      // Act
      await getAllTodos(mReq, mRes, mNext);

      // Assert
      expect(mRes.status).toBeCalledWith(200);
      expect(mRes.json.mock.calls[0][0].length).toBe(3);
      expect(mRes.json.mock.calls[0][0][0].task).toBe('Eat');
      expect(mRes.json).toBeCalledWith([{"completed": true, "id": 1, "task": "Eat"}, {"completed": false, "id": 2, "task": "Sleep"}, {"completed": false, "id": 3, "task": "Pray"}])
    })
  })
```

**NOTE:** The last assertion here is an example way of checking the json response that performs a similar finction to the preceeding two assertions. This latter way is easier to remember  and understand but reuires the full json response to be known in advance.

### Run the unit tests

```bash
npm test
```

All tests should pass.

**At this point, the first API endpoint is complete, refactored, and fully tested.**

## GET /todos/:id 1 - Basic getTodoById controller function and unit test

### Create the single todo controller function

In the todoController.js file, create the `getTodoById` function:
```javascript
const getTodoById = async (req, res, next) => {
  const { id } = req.params;
  const getSingleTodoQuery = 'SELECT * FROM todos WHERE id = $1';

  try {
    const results = await pool.query(getSingleTodoQuery, [id]);
    res.status(200).json(results.rows);
  } catch (error) {
    next(error);
  }
}
```

**NOTE:** There is currently no error handling for the case where the `id` does not exist in the database or is an invalid type. If no `id` is supplied then the request will reach the all todos endpoint.

### Add getTodoById to the todoController export

```javascript
module.exports = {
  getAllTodos,
  getTodoById
};
```

### Create a 'happy route' test for the single todo controller function

In the todoController.test.js file, add `getTodoById` to the imports.
```javascript
const { getAllTodos, getTodoById } = require('./todoController');
```

Add a `describe` block for the `getTodoById` function and a **parameterised** `test` block for the happy route providing each tyest with `id`, `task`, and `completed` parameters.
```javascript
describe('getTodoById()', () => {
    test.each([
      [1, 'Eat', true],
      [2, 'Sleep', false],
      [3, 'Pray', false],
    ])('should return an array with a single todo object and status 200 when called with the id param of %s', async (id, task, completed) => {
      // Arrange
      const mReq = {
        params: {
          id
        }
      };
      const mRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mNext = jest.fn();

      // Act
      await getTodoById(mReq, mRes, mNext);

      // Assert
      expect(mRes.status).toBeCalledWith(200);
      expect(mRes.json.mock.calls[0][0].length).toBe(1);
      expect(mRes.json.mock.calls[0][0][0].id).toBe(id);
      expect(mRes.json.mock.calls[0][0][0].task).toBe(task);
      expect(mRes.json.mock.calls[0][0][0].completed).toBe(completed);
      expect(mRes.json).toBeCalledWith([{id, task, completed}])
    })
  })
```

**NOTE:** The `test.each` block is a parameterised test that runs the same test with different parameters. This is a good way to test the same function with different inputs.

**NOTE:** The last assertion in this test is an alternative to the previous three and in this case probably a much better option.

## GET /todos/:id 2 - Error handling in the getTodoById controller function and unit testing errors

### Add a helper function to make the `id` parameter a number
In the controller file, create a `getIdNumber` helper function.
```javascript
const getIdNumber = (req) => {
  let { id } = req.params;
  if (typeof id !== 'number' || isNaN(id) || id % 1 !== 0) return null;
  return Number(id);
}
```
This validates the `id` parameter and returns it as a number or `null` if it is not parseable as a number and then unsures that is is returned as a number.

### Validate the `id` parameter type
Right after the `id` is returned from the `getIdNumber` function, add a check to see if it is `null`. If it is, return an error.
```javascript
if (!id) return next({ status: 400, message: `Invalid id provided. ID must be a number.` });
```

### Add error handling for the case where the `id` does not exist in the database
In the `try` block, add a check to see if `results.rows` is empty. If it is, throw an error.
```javascript
if (!results.rows.length) return next({status: 404, message: `No todo with an ID of ${id} could be found in the database.`})
```

### Add controller function tests for invalid and non-existent `id` parameters

Add new parameterised tests providing each test with an `id`, `status`, and `errorMessage` parameter.
```javascript
test.each([
      [2000, 404, 'No todo with an ID of 2000 could be found in the database.'],
      ['dog', 400, 'Invalid id provided. ID must be a number.'],
      [true, 400, 'Invalid id provided. ID must be a number.'],
    ])('should return an appropriate status and error message when called with an ID param of %s', async (id, status, errorMessage) => {
      // Arrange
      const mReq = {
        params: {
          id
        }
      };
      const mRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mNext = jest.fn();

      // Act
      await getTodoById(mReq, mRes, mNext);

      // Assert
      expect(mRes.status).not.toHaveBeenCalled();
      expect(mNext).toHaveBeenCalledWith({ status, message: errorMessage })
      expect(mNext.mock.calls[0][0].status).toBe(status);
      expect(mNext.mock.calls[0][0].message).toBe(errorMessage);
    })
```

**NOTE:** The second assertion here is an alternative to the third and fourth assertions. Take you pick but there is no point in including both.

## GET /todos/:id 3 - Add the single todo route and write integration tests

### Create the single todo route

Add the `getTodoById` function to the todoController imports.
```javascript
const { getAllTodos, getTodoById } = require('../controllers/todoController');
```

In the routes/todoRoutes.js file, add the single todo route:
```javascript
router.get('/:id', getTodoById);
```

### Add a 'happy route' integration test for the single todo route

Within the over-arching `describe` block in the app.test.js file:
```javascript
describe('GET /todos/:id', () => {
    test.each([
      [1, 'Eat', true],
      [2, 'Sleep', false],
      [3, 'Pray', false]
    ])('should return an array with a single todo and status 200 when called with an ID param of %s', async (id, task, completed) => {
      // Act
      const response = await request(app).get(`/todos/${id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].task).toBe(task);
      expect(response.body[0].completed).toBe(completed);
    })
  })
```

### Add integration tests for invalid and non-existent `id` parameters

Within the `GET /todos/:id` `describe` block:
```javascript
test.each([
      [2000, 404, 'No todo with an ID of 2000 could be found in the database.'],
      ['dog', 400, 'Invalid id provided. ID must be a number.'],
      [true, 400, 'Invalid id provided. ID must be a number.']
    ])('should return an appropriate status and error message when called with an ID param of %s', async (id, status, errorMessage) => {
      // Act
      const response = await request(app).get(`/todos/${id}`);

      // Assert
      expect(response.status).toBe(status);
      expect(response.body.message).toBe(errorMessage);
    })
```

## POST /todos 1 - Basic addTodo controller function and unit tests

### Create the basic addTodo controller function

In the todoController.js file, create the `addTodo` function:
```javascript
const addTodo = async (req, res, next) => {
  const { task } = req.body;
  const addTodoQuery = 'INSERT INTO todos (task, completed) VALUES ($1, false) RETURNING *';

  try {
    const results = await pool.query(addTodoQuery, [task]);
    res.status(201).json(results.rows);
  } catch (error) {
    next(error);
  }
};
```












