const request = require('supertest');
const express = require('express');

// Mock everything before imports
jest.mock('../database/supabaseClient', () => ({
  supabase: {
    from: jest.fn()
  },
  supabaseAdmin: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}));

const { supabase, supabaseAdmin } = require('../database/supabaseClient');
const dietsRouter = require('../routes/diets');
const { authenticateToken } = require('../middleware/auth');

// Create test app
const app = express();
app.use(express.json());

// Mount routes WITHOUT auth middleware for simpler testing
app.use('/api/diets', dietsRouter);

describe('Diets API Routes (Simple Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/diets', () => {
    test('should return list of diets on success', async () => {
      const mockDiets = [
        { id: 1, name: 'Keto Diet', description: 'Low carb diet', calories: 1800 },
        { id: 2, name: 'Mediterranean', description: 'Balanced diet', calories: 2000 }
      ];

      // Mock the complete chain
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockDiets,
        error: null
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const res = await request(app)
        .get('/api/diets');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockDiets);
      expect(supabase.from).toHaveBeenCalledWith('diets');
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
        .get('/api/diets');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error al obtener dietas');
    });
  });

  describe('GET /api/diets/:id', () => {
    test('should return a specific diet when found', async () => {
      const mockDiet = { 
        id: 1, 
        name: 'Keto Diet', 
        description: 'Low carb diet', 
        calories: 1800 
      };

      // Mock the complete chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockDiet,
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
        .get('/api/diets/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockDiet);
    });

    test('should return 404 when diet not found', async () => {
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
        .get('/api/diets/999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Dieta no encontrada');
    });
  });

  describe('POST /api/diets', () => {
    test('should create a new diet with valid data', async () => {
      const newDiet = {
        name: 'Vegan Diet',
        description: 'Plant-based diet',
        calories: 1900
      };

      const createdDiet = { id: 3, ...newDiet };

      // Mock the complete chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: createdDiet,
        error: null
      });
      
      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle
      });
      
      const mockInsert = jest.fn().mockReturnValue({
        select: mockSelect
      });
      
      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const res = await request(app)
        .post('/api/diets')
        .send(newDiet);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(createdDiet);
    });

    test('should return 400 for missing required fields', async () => {
      const incompleteDiet = {
        name: 'Test Diet'
        // Missing description and calories
      };

      const res = await request(app)
        .post('/api/diets')
        .send(incompleteDiet);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Faltan campos requeridos');
    });
  });

  describe('PUT /api/diets/:id', () => {
    test('should update a diet with valid data', async () => {
      const updateData = {
        name: 'Updated Diet',
        description: 'Updated description',
        calories: 2100
      };

      const updatedDiet = { id: 1, ...updateData };

      // Mock the complete chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: updatedDiet,
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
        .put('/api/diets/1')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(updatedDiet);
    });

    test('should return 400 when calories is null', async () => {
      const invalidUpdate = {
        name: 'Test Diet',
        description: 'Test description',
        calories: null
      };

      const res = await request(app)
        .put('/api/diets/1')
        .send(invalidUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Todos los campos son requeridos');
    });
  });

  describe('DELETE /api/diets/:id', () => {
    test('should delete a diet successfully', async () => {
      // Mock the complete chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: { name: 'Deleted Diet' },
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
        .delete('/api/diets/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Dieta eliminada correctamente');
    });
  });
});