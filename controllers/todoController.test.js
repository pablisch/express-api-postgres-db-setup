const resetDbData = require('../utils/resetDbData');
const { getAllTodos, getTodoById, addTodo, deleteTodo, updateTodo } = require('./todoController');

describe('Todo routes controller functions unit tests', () => {

  beforeEach( async () => {
    await resetDbData();
  });

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
      expect(mRes.json).toBeCalledWith([{ id, task, completed }])
    })

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
  });

  describe('addTodo()', () => {
    test.each(['Climb', 'Swim', 'Climb a tree'])('should add a todo to the database and return an array with the added todo and status 201', async (task) => {
      // Arrange
      const mReq = {
        body: {
          task
        }
      };
      const mRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mNext = jest.fn();

      // Act
      await addTodo(mReq, mRes, mNext);

      // Assert
      expect(mRes.status).toHaveBeenCalledWith(201);
      expect(mRes.json.mock.calls[0][0].length).toBe(1);
      expect(mRes.json.mock.calls[0][0][0].task).toBe(task);
      expect(mRes.json.mock.calls[0][0][0].completed).toBe(false);
    })
  })

  test.each([
    [undefined, 'No task was provided.'],
    ['', 'No task was provided.'],
    [212, 'Task must be a string.'],
    [true, 'Task must be a string.'],
  ])('should return status 400 and an appropriate error message when passed task, "%s" in the request body', async (task, errorMessage) => {
    // Arrange
    const mReq = {
      body: {
        task
      }
    };
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mNext = jest.fn();

    // Act
    await addTodo(mReq, mRes, mNext);

    // Assert
    expect(mRes.status).not.toHaveBeenCalled();
    expect(mNext).toHaveBeenCalledWith({ status: 400, message: errorMessage });
    expect(mNext.mock.calls[0][0].status).toBe(400);
    expect(mNext.mock.calls[0][0].message).toBe(errorMessage);
  })

  describe('deleteTodo()', () => {
    test.each([
      [1, 'Eat', true],
      [2, 'Sleep', false],
      [3, 'Pray', false]
    ])('should delete todo with id %s from the database and return status 200 and an array contianing only the deleted todo object', async (id, task, completed) => {
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
      await deleteTodo(mReq, mRes, mNext);

      // Assert
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith([{ id, task, completed }]);
      expect(mRes.json.mock.calls[0][0].length).toBe(1);
      expect(mRes.json.mock.calls[0][0][0].task).toBe(task)
    })

    test.each([
      ['cat', 400, 'Invalid id provided. ID must be a number.'],
      [true, 400, 'Invalid id provided. ID must be a number.'],
      [2000, 404, 'No todo with an ID of 2000 could be found in the database.'],
    ])('should return an appropriate status and error message when passed params ID of "%s"', async (id, status, errorMessage) => {
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
      await deleteTodo(mReq, mRes, mNext);

      // Assert
      expect(mRes.status).not.toHaveBeenCalled();
      expect(mNext).toHaveBeenCalledWith({ status, message: errorMessage });
      expect(mNext.mock.calls[0][0].status).toBe(status);
      expect(mNext.mock.calls[0][0].message).toBe(errorMessage);
    })
  })

  describe('updateTodo()', () => {
    test.each([
      [1, "Jump", false],
      [2, "Dream", true],
      [1, "Swim", true],
    ])('should update todo in the database and return status 201 and the updated todo object', async (id, task, completed) => {
      // Arrange
      const mReq = {
        params: {
          id
        },
        body: {
          task, completed
        }
      };
      const mRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mNext = jest.fn();

      // Act 
      await updateTodo(mReq, mRes, mNext);

      // Assert
      expect(mRes.status).toHaveBeenCalledWith(201);
      expect(mRes.json).toHaveBeenCalledWith([{ id, task, completed }]);
      expect(mRes.json.mock.calls[0][0].length).toBe(1);
      expect(mRes.json.mock.calls[0][0][0].id).toBe(id);
      expect(mRes.json.mock.calls[0][0][0].task).toBe(task);
      expect(mRes.json.mock.calls[0][0][0].completed).toBe(completed);
    })
    
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
    ])('should return an appropriate status and error message for todo with id of "%s", task "%s" and completed property "%s"', async (id, task, completed, status, errorMessage) => {
      // Arrange
      const mReq = {
        params: {
          id
        },
        body: {
          task, completed
        }
      };
      const mRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mNext = jest.fn();

      // Act 
      await updateTodo(mReq, mRes, mNext);

      // Assert
      expect(mRes.status).not.toHaveBeenCalled();
      expect(mNext).toHaveBeenCalledWith({ status, message: errorMessage });
      expect(mNext.mock.calls[0][0]).toEqual({ status, message: errorMessage });
      expect(mNext.mock.calls[0][0].status).toBe(status);
      expect(mNext.mock.calls[0][0].message).toBe(errorMessage);
    })
  })
})