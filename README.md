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

INSERT INTO todos ("item", "completed") VALUES
('Eat', true),
('Sleep', false),
('Pray', false)
;

-- psql -h 127.0.0.1 todolist < tables.sql
-- psql -h 127.0.0.1 todolist < seeds.sql
```

### Setup database connection




