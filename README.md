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
touch .env .gitignore server.js app.js app.test.js db.js seeds.sql tables.sql utils/reset-db-data.js utils/set-up-tables.js routes/todoRoutes.js controllers/todoController.js controllers/todoController.test.js
```
Add required file exemptions to .gitignore, e.g.
```
node_modules
.DS_Store
.env
```

## Setting up the database

### Setup tables




