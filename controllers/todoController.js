const pool = require('../db');

const getAllTodos = async (req, res, next) => {
  const getAllTodosQuery = 'SELECT * FROM todos';

  try {
    const results = await pool.query(getAllTodosQuery);
    res.status(200).json(results.rows);
  } catch (error) {
    next(error);
  }
};

const getTodoById = async (req, res, next) => {
  const id = getIdNumber(req);
  if (!id) return next({ status: 400, message: `Invalid id provided. ID must be a number.` });

  const getSingleTodoQuery = 'SELECT * FROM todos WHERE id = $1';

  try {
    const results = await pool.query(getSingleTodoQuery, [id]);
    if (!results.rows.length) return next({ status: 404, message: `No todo with an ID of ${id} could be found in the database.` })
    res.status(200).json(results.rows);
  } catch (error) {
    next(error);
  }
};

const addTodo = async (req, res, next) => {
  const { task } = req.body;
  if (!task) return next({ status: 400, message: 'No task was provided.' });
  if (typeof task !== 'string') return next({status: 400, message: 'Task must be a string.'})

  const addTodoQuery = 'INSERT INTO todos (task, completed) VALUES ($1, false) RETURNING *';

  try {
    const results = await pool.query(addTodoQuery, [task]);
    res.status(201).json(results.rows);
  } catch (error) {
    next(error);
  }
};

const deleteTodo = async (req, res, next) => {
  const id = getIdNumber(req);
  if (!id) return next({ status: 400, message: 'Invalid id provided. ID must be a number.' });

  const deleteTodoQuery = 'DELETE FROM todos WHERE id = $1 RETURNING *';

  try {
    const results = await pool.query(deleteTodoQuery, [id]);
    if (!results.rows.length) return next({ status: 404, message: `No todo with an ID of ${id} could be found in the database.` });
    res.status(200).json(results.rows);
  } catch (error) {
    next(error);
  }
}

const updateTodo = async (req, res, next) => {
  const id = getIdNumber(req);
  if (!id) return next({ status: 400, message: 'Invalid id provided. ID must be a number.' });

  const { task, completed } = req.body;
  if (!task || !completed && completed !== false) return next({ status: 400, message: 'Task and completed properties are required to update this todo.' });
  if (typeof completed !== 'boolean') return next({status: 400, message: 'The completed property must be of type boolean.'})
  if (typeof task !== 'string') return next({status: 400, message: 'The task property must be of type string.'})
  
  const updateTodoQuery = 'UPDATE todos SET task = $1, completed = $2 WHERE id = $3 RETURNING *';

  try {
    const results = await pool.query(updateTodoQuery, [task, completed, id]);
    if (!results.rows.length) return next({ status: 404, message: `No todo with an ID of ${id} could be found in the database.` });
    res.status(201).json(results.rows);
  } catch (error) {
    next (error)
  }
}

const getIdNumber = (req) => {
  let { id } = req.params;
  if (isNaN(id) || id === true) return null;
  return Number(id);
}

module.exports = {
  getAllTodos,
  getTodoById,
  addTodo,
  deleteTodo,
  updateTodo,
};