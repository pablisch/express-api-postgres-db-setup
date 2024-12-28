const express = require('express');
const todoRoutes = require('./routes/todoRoutes');
const cors = require('cors');
//
const app = express();

app.use(express.json());

app.use(cors());

app.use('/todos', todoRoutes);

// app.get('/todos', (req, res) => {
//   res.status(200).send({message: 'Welcome Back!'});
//
// })

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message });
});

module.exports = app;