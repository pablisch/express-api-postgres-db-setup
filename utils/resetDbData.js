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