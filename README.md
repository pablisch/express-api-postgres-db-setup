# Express API with PostgreSQL Database setup

This project is simply to outline the processes involved in setting up an Express API with a PostgreSQL database.

Code files included are purely intended as a comprehenisve example of the instructions provided in this README.md file.

The order in which the API and database are made are optional. These instructions provide one possible order.

The details of both the API and database obviously depend on the specific requirements of the project but for the sake of an example, this will be in the form of a simple to-do list project.

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

### Setup tables

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

### Setup seeds

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

## Build the the API - Part 1

### Setup the server

In the app.js file, create the Express server and set up the required middleware. For example:
```
const express = require('express');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: "it's ok" });
});

// app.use('/todos', todoRoutes);

module.exports = app;
```

In the server.js file, start the server. For example:
```
const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Write scripts for starting the server and running tests

In the package.json file, add the following scripts:
```
"scripts": {
  "start": "node server.js",
  "test": "jest --watchAll --detectOpenHandles"
}
```

## Write an 







