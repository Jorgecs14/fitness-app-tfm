const request = require('supertest');
const express = require('express');

// Mock everything before imports
jest.mock('../database/supabaseClient', () => ({
  supabase: {
    from: jest.fn()
  },
  supabaseAdmin: {
    auth: {
      signUp: jest.fn()
    },
    from: jest.fn()
  }
}));

const { supabase, supabaseAdmin } = require('../database/supabaseClient');
const usersRouter = require('../routes/users');

// Create test app
const app = express();
app.use(express.json());

// Mount routes WITHOUT auth middleware for simpler testing
app.use('/api/users', usersRouter);

describe('Users API Routes (Simple Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    test('should return list of users on success', async () => {
      const mockUsers = [
        { id: 1, name: 'John', surname: 'Doe', email: 'john@example.com', role: 'client' },
        { id: 2, name: 'Jane', surname: 'Smith', email: 'jane@example.com', role: 'trainer' }
      ];

      // Mock the complete chain
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockUsers,
        error: null
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const res = await request(app)
        .get('/api/users');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUsers);
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('id');
    });

    test('should return 500 on database error', async () => {
      // Mock database error
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database connection failed')
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const res = await request(app)
        .get('/api/users');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error al obtener usuarios');
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return a specific user when found', async () => {
      const mockUser = { 
        id: 1, 
        name: 'John', 
        surname: 'Doe', 
        email: 'john@example.com',
        role: 'client'
      };

      // Mock the complete chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUser,
        error: null
      });
      
      const mockEq = jest.fn().mockReturnValue({
        single: mockSingle
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const res = await request(app)
        .get('/api/users/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUser);
    });

    test('should return 404 when user not found', async () => {
      // Mock not found
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null
      });
      
      const mockEq = jest.fn().mockReturnValue({
        single: mockSingle
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const res = await request(app)
        .get('/api/users/999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });
  });

  describe('POST /api/users', () => {
    test('should create a new user with valid data', async () => {
      const newUser = {
        name: 'Alice',
        surname: 'Johnson',
        email: 'alice@example.com',
        password: 'securePassword123',
        birth_date: '1990-01-01'
      };

      const mockAuthUser = {
        user: { id: 'auth-789', email: 'alice@example.com' },
        session: null
      };

      const createdUser = { 
        id: 3, 
        auth_user_id: 'auth-789',
        name: 'Alice',
        surname: 'Johnson',
        email: 'alice@example.com',
        birth_date: '1990-01-01',
        role: 'client'
      };

      // Mock Supabase auth admin
      supabaseAdmin.auth = {
        admin: {
          createUser: jest.fn().mockResolvedValue({
            data: mockAuthUser,
            error: null
          })
        }
      };

      // Mock the user lookup
      const mockSingle = jest.fn().mockResolvedValue({
        data: createdUser,
        error: null
      });
      
      const mockEq = jest.fn().mockReturnValue({
        single: mockSingle
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const res = await request(app)
        .post('/api/users')
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        id: 3,
        name: 'Alice',
        surname: 'Johnson',
        email: 'alice@example.com'
      });
    });

    test('should return 400 for missing required fields', async () => {
      const incompleteUser = {
        name: 'Test User'
        // Missing email, password, birth_date
      };

      const res = await request(app)
        .post('/api/users')
        .send(incompleteUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Faltan campos requeridos (email, password, name, surname, birth_date)');
    });

    test('should return 500 for duplicate email', async () => {
      const newUser = {
        name: 'Bob',
        surname: 'Wilson',
        email: 'existing@example.com',
        password: 'password123',
        birth_date: '1985-05-15'
      };

      // Mock auth admin failure
      supabaseAdmin.auth = {
        admin: {
          createUser: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'User already registered' }
          })
        }
      };

      const res = await request(app)
        .post('/api/users')
        .send(newUser);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error al crear usuario');
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update a user with valid data', async () => {
      const updateData = {
        name: 'John Updated',
        surname: 'Doe Updated',
        email: 'john.updated@example.com'
      };

      const updatedUser = { id: 1, ...updateData, role: 'client' };

      // Mock the complete chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: updatedUser,
        error: null
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle
      });
      
      const mockEq = jest.fn().mockReturnValue({
        select: mockSelect
      });
      
      const mockUpdate = jest.fn().mockReturnValue({
        eq: mockEq
      });
      
      supabase.from.mockReturnValue({
        update: mockUpdate
      });

      const res = await request(app)
        .put('/api/users/1')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject(updateData);
    });

    test('should update user even with partial data', async () => {
      const partialUpdate = {
        name: 'Test'
        // PUT allows partial updates in this implementation
      };

      const updatedUser = { 
        id: 1, 
        name: 'Test', 
        surname: null,
        email: null,
        role: 'client' 
      };

      // Mock the complete chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: updatedUser,
        error: null
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle
      });
      
      const mockEq = jest.fn().mockReturnValue({
        select: mockSelect
      });
      
      const mockUpdate = jest.fn().mockReturnValue({
        eq: mockEq
      });
      
      supabase.from.mockReturnValue({
        update: mockUpdate
      });

      const res = await request(app)
        .put('/api/users/1')
        .send(partialUpdate);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Test');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete a user successfully', async () => {
      // Mock the complete chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: { email: 'deleted@example.com' },
        error: null
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle
      });
      
      const mockEq = jest.fn().mockReturnValue({
        select: mockSelect
      });
      
      const mockDelete = jest.fn().mockReturnValue({
        eq: mockEq
      });
      
      supabase.from.mockReturnValue({
        delete: mockDelete
      });

      const res = await request(app)
        .delete('/api/users/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Usuario deleted@example.com eliminado correctamente');
    });

    test('should return 404 when user not found', async () => {
      // Mock not found
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle
      });
      
      const mockEq = jest.fn().mockReturnValue({
        select: mockSelect
      });
      
      const mockDelete = jest.fn().mockReturnValue({
        eq: mockEq
      });
      
      supabase.from.mockReturnValue({
        delete: mockDelete
      });

      const res = await request(app)
        .delete('/api/users/999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });
  });
});