const request = require('supertest');
const express = require('express');

// Mock Supabase before requiring the auth middleware
jest.mock('../database/supabaseClient', () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}));

const { supabaseAdmin } = require('../database/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

// Create a test app
const app = express();
app.use(express.json());

// Test route with authentication
app.get('/test-auth', authenticateToken, (req, res) => {
  res.json({ message: 'Authenticated', user: req.user });
});

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 401 when no token is provided', async () => {
    const res = await request(app)
      .get('/test-auth');
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Token de acceso requerido');
  });

  test('should return 403 when token is invalid', async () => {
    // Mock Supabase auth to return error
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid token')
    });

    const res = await request(app)
      .get('/test-auth')
      .set('Authorization', 'Bearer invalidtoken');
    
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error', 'Token inválido o expirado');
  });

  test('should allow access with valid token and existing user', async () => {
    const mockAuthUser = { 
      id: 'auth-123', 
      email: 'test@example.com',
      user_metadata: { first_name: 'Test', last_name: 'User' }
    };
    
    const mockDbUser = {
      id: 1,
      auth_user_id: 'auth-123',
      email: 'test@example.com',
      name: 'Test',
      surname: 'User',
      role: 'client'
    };

    // Mock successful auth
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null
    });

    // Mock database query for user
    supabaseAdmin.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: mockDbUser,
        error: null
      })
    });

    const res = await request(app)
      .get('/test-auth')
      .set('Authorization', 'Bearer validtoken');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Authenticated');
    expect(res.body.user).toMatchObject({
      id: 1,
      email: 'test@example.com'
    });
  });

  test('should create new user if not exists in database', async () => {
    const mockAuthUser = { 
      id: 'auth-456', 
      email: 'newuser@example.com',
      user_metadata: {}
    };
    
    const mockNewDbUser = {
      id: 2,
      auth_user_id: 'auth-456',
      email: 'newuser@example.com',
      name: '',
      surname: '',
      role: 'client'
    };

    // Mock successful auth
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null
    });

    // Mock database query - user not found
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockMaybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: null
    });

    // Mock insert for new user
    const mockInsert = jest.fn().mockReturnThis();
    const mockInsertSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockNewDbUser,
      error: null
    });

    supabaseAdmin.from.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: mockSelect,
          eq: mockEq,
          maybeSingle: mockMaybeSingle,
          insert: mockInsert,
          single: mockSingle
        };
      }
    });

    const res = await request(app)
      .get('/test-auth')
      .set('Authorization', 'Bearer validtoken');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('newuser@example.com');
  });

  test('should return 401 when Authorization header is malformed', async () => {
    const res = await request(app)
      .get('/test-auth')
      .set('Authorization', 'InvalidFormat');
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Token de acceso requerido');
  });
});