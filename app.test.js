const request = require('supertest');
const app = require('./app');
const resetDbData = require('./utils/resetDbData');
const { reset } = require('nodemon');

describe('App todo endpoint integration tests', () => {

  beforeEach(async () => {
    await resetDbData();
  });

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
  })

  describe('POST /todos', () => {
    test.each(['Climb', 'Swim', 'Climb a tree'])('should add a todo to the database and return status 201 and an array containing the created todo object', async (task) => {
      // Act
      const response = await request(app).post('/todos').send({ task });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.length).toBe(1);
      expect(response.body[0].task).toBe(task);
      expect(response.body[0].completed).toBe(false);
    })

    test.each([
      [undefined, 'No task was provided.'],
      ['', 'No task was provided.'],
      [212, 'Task must be a string.'],
      [true, 'Task must be a string.'],
    ])('should return status 400 and an appropriate error message when given task value of %s', async (task, errorMessage) => {
      // Act
      const response = await request(app).post('/todos').send({ task });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(errorMessage);
    })
  })

  describe('DELETE /todos/:id', () => {
    test.each([
      [1, 'Eat', true],
      [2, 'Sleep', false],
      [3, 'Pray', false],
    ])('should delete todo from database and return status 200 and an array with the deleted todo object with id, "%s"', async (id, task, completed) => {
      // Act 
      const response = await request(app).delete(`/todos/${id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id, task, completed }]);
      expect(response.body[0].id).toBe(id);
      expect(response.body[0].task).toBe(task);
      expect(response.body[0].completed).toBe(completed);
    });

    test.each([
      ['cat', 400, 'Invalid id provided. ID must be a number.'],
      [true, 400, 'Invalid id provided. ID must be a number.'],
      [2000, 404, 'No todo with an ID of 2000 could be found in the database.'],
    ])('should return an appropriate status and error message when passed the ID param, "%s"', async (id, status, errorMessage) => {
      // Act
      const response = await request(app).delete(`/todos/${id}`);

      // Assert
      expect(response.status).toBe(status);
      expect(response.body.message).toBe(errorMessage);
      expect(response.body).toEqual({ message: errorMessage });
    })
  });

  describe('UPDATE /todos/:id', () => {
    test.each([
      [1, 'Eat', false],
      [2, 'Dream', true],
      [3, 'Pray', true],
      [1, 'Swim', false],
      [2, 'Dream', false],
    ])('should update todo in the database and return status 201 and an array with the updated todo object with id, "%s"', async (id, task, completed) => {
      // Act 
      const response = await request(app).put(`/todos/${id}`).send({ task, completed });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual([{ id, task, completed }]);
      expect(response.body[0].id).toBe(id);
      expect(response.body[0].task).toBe(task);
      expect(response.body[0].completed).toBe(completed);
    });

    test.each([
      [1, '', false, 400, 'Task and completed properties are required to update this todo.'],
      [2, 'Dream', undefined, 400, 'Task and completed properties are required to update this todo.'],
      [3, 'Dream', 'fish', 400, 'The completed property must be of type boolean.'],
      [1, 'Dream', 212, 400, 'The completed property must be of type boolean.'],
      [2, true, true, 400, 'The task property must be of type string.'],
      [3, 212, true, 400, 'The task property must be of type string.'],
      [3000, 'Fly', 'pig', 400, 'The completed property must be of type boolean.'],
      ['cat', 'Fly', true, 400, 'Invalid id provided. ID must be a number.'],
      [3000, 'Fly', true, 404, 'No todo with an ID of 3000 could be found in the database.'],
    ])('should return an appropriate status and error message when passed the ID param, "%s"', async (id, task, completed, status, errorMessage) => {
      // Act
      const response = await request(app).put(`/todos/${id}`).send({ task, completed });

      // Assert
      expect(response.status).toBe(status);
      expect(response.body.message).toBe(errorMessage);
      expect(response.body).toEqual({ message: errorMessage });
    });
  });
});


