const request = require("supertest");
const express = require("express");

// Mock de Supabase completo antes de importar
jest.mock("../database/supabaseClient", () => ({
  supabase: {
    from: jest.fn(), 
  },
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const { supabase } = require("../database/supabaseClient");
const dietsRouter = require("../routes/diets");
const { authenticateToken } = require("../middleware/auth");

const app = express();
app.use(express.json());

app.use("/api/diets", dietsRouter);

describe("Diets API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/diets", () => {
    test("debería retornar lista de dietas exitosamente", async () => {
      const mockDiets = [
        {
          id: 1,
          name: "Dieta Keto",
          description: "Baja en carbohidratos",
          calories: 1800,
        },
        {
          id: 2,
          name: "Dieta Mediterránea",
          description: "Balanceada",
          calories: 2000,
        },
      ];

      const mockOrder = jest.fn().mockResolvedValue({
        data: mockDiets,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder, 
      });

      supabase.from.mockReturnValue({
        select: mockSelect, 
      });

      const res = await request(app).get("/api/diets");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockDiets);
      expect(supabase.from).toHaveBeenCalledWith("diets");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("id");
    });

    test("debería retornar 500 en error de base de datos", async () => {

      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: new Error("Database connection failed"),
      });

      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });

      const res = await request(app).get("/api/diets");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Error al obtener dietas");
    });
  });

  describe("GET /api/diets/:id", () => {
    test("debería retornar una dieta específica cuando existe", async () => {
      const mockDiet = {
        id: 1,
        name: "Dieta Keto",
        description: "Baja en carbohidratos",
        calories: 1800,
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockDiet,
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq, 
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });


      const res = await request(app).get("/api/diets/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockDiet);
    });

    test("debería retornar 404 cuando la dieta no existe", async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });

      const res = await request(app).get("/api/diets/999");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Dieta no encontrada");
    });
  });

  describe("POST /api/diets", () => {
    test("debería crear una nueva dieta con datos válidos", async () => {

      const newDiet = {
        name: "Dieta Vegana",
        description: "Basada en plantas",
        calories: 1900,
      };

      const createdDiet = { id: 3, ...newDiet };

      const mockSingle = jest.fn().mockResolvedValue({
        data: createdDiet,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: mockSelect, 
      });

      supabase.from.mockReturnValue({
        insert: mockInsert, 
      });

      const res = await request(app).post("/api/diets").send(newDiet);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(createdDiet);
    });

    test("debería retornar 400 cuando faltan campos requeridos", async () => {
      const incompleteDiet = {
        name: "Dieta Test",
      };

      const res = await request(app).post("/api/diets").send(incompleteDiet);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Faltan campos requeridos");
    });
  });

  describe("PUT /api/diets/:id", () => {
    test("debería actualizar una dieta con datos válidos", async () => {
      const updateData = {
        name: "Dieta Actualizada",
        description: "Descripción actualizada",
        calories: 2100,
      };

      const updatedDiet = { id: 1, ...updateData };

      const mockSingle = jest.fn().mockResolvedValue({
        data: updatedDiet,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockEq = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockUpdate = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        update: mockUpdate,
      });

      const res = await request(app).put("/api/diets/1").send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(updatedDiet);
    });

    test("debería retornar 400 cuando las calorías son nulas", async () => {
      const invalidUpdate = {
        name: "Test Diet",
        description: "Test description",
        calories: null,
      };

      const res = await request(app).put("/api/diets/1").send(invalidUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Todos los campos son requeridos"
      );
    });
  });

  describe("DELETE /api/diets/:id", () => {
    test("debería eliminar una dieta exitosamente", async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { name: "Dieta Eliminada" }, 
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockEq = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockDelete = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        delete: mockDelete,
      });

      const res = await request(app).delete("/api/diets/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Dieta eliminada correctamente"
      );
    });
  });
});
