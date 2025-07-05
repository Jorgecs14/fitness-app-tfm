const request = require("supertest");
const express = require("express");

// Mock de Supabase completo antes de importar
jest.mock("../database/supabaseClient", () => ({
  supabase: {
    from: jest.fn(), // Cliente normal para queries
  },
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(), // Cliente admin (aunque no lo usamos aquí)
  },
}));

// Importar después del mock
const { supabase } = require("../database/supabaseClient");
const dietsRouter = require("../routes/diets");
const { authenticateToken } = require("../middleware/auth");

// Crear app de prueba
const app = express();
app.use(express.json());

// Montar rutas SIN middleware de auth para simplificar tests
// En producción estas rutas estarían protegidas
app.use("/api/diets", dietsRouter);

describe("Diets API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/diets", () => {
    test("debería retornar lista de dietas exitosamente", async () => {
      // Datos de prueba
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

      // Mock de la cadena: supabase.from('diets').select('*').order('id')
      // Se construye de atrás hacia adelante
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockDiets,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder, // select() retorna objeto con método order()
      });

      supabase.from.mockReturnValue({
        select: mockSelect, // from() retorna objeto con método select()
      });

      // Ejecutar petición
      const res = await request(app).get("/api/diets");

      // Verificar respuesta
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockDiets);
      expect(supabase.from).toHaveBeenCalledWith("diets");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("id");
    });

    test("debería retornar 500 en error de base de datos", async () => {
      // Simula un error de Supabase
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

      // Ejecutar petición
      const res = await request(app).get("/api/diets");

      // Verificar manejo de error
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

      // Mock: supabase.from('diets').select('*').eq('id', id).single()
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockDiet,
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({
        single: mockSingle, // eq() retorna objeto con single()
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq, // select() retorna objeto con eq()
      });

      supabase.from.mockReturnValue({
        select: mockSelect, // from() retorna objeto con select()
      });

      // Petición con ID específico
      const res = await request(app).get("/api/diets/1");

      // Verificar que retorna la dieta correcta
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockDiet);
    });

    test("debería retornar 404 cuando la dieta no existe", async () => {
      // Mock para no encontrado
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
      // Datos de la nueva dieta
      const newDiet = {
        name: "Dieta Vegana",
        description: "Basada en plantas",
        calories: 1900,
      };

      // Respuesta simulada (incluye ID generado)
      const createdDiet = { id: 3, ...newDiet };

      // Mock: supabase.from('diets').insert([dietData]).select().single()
      const mockSingle = jest.fn().mockResolvedValue({
        data: createdDiet,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle, // select() retorna objeto con single()
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: mockSelect, // insert() retorna objeto con select()
      });

      supabase.from.mockReturnValue({
        insert: mockInsert, // from() retorna objeto con insert()
      });

      // Enviar petición POST con datos
      const res = await request(app).post("/api/diets").send(newDiet);

      // Verificar creación exitosa
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(createdDiet);
    });

    test("debería retornar 400 cuando faltan campos requeridos", async () => {
      const incompleteDiet = {
        name: "Dieta Test",
        // Faltan description y calories - campos obligatorios
      };

      // No necesitamos mock - la validación ocurre antes
      const res = await request(app).post("/api/diets").send(incompleteDiet);

      // Verifica que se rechace por validación
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Faltan campos requeridos");
    });
  });

  describe("PUT /api/diets/:id", () => {
    test("debería actualizar una dieta con datos válidos", async () => {
      // Datos para actualizar
      const updateData = {
        name: "Dieta Actualizada",
        description: "Descripción actualizada",
        calories: 2100,
      };

      // Respuesta simulada después de actualizar
      const updatedDiet = { id: 1, ...updateData };

      // Mock: supabase.from('diets').update(updateData).eq('id', id).select().single()
      const mockSingle = jest.fn().mockResolvedValue({
        data: updatedDiet,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle, // select() retorna objeto con single()
      });

      const mockEq = jest.fn().mockReturnValue({
        select: mockSelect, // eq() retorna objeto con select()
      });

      const mockUpdate = jest.fn().mockReturnValue({
        eq: mockEq, // update() retorna objeto con eq()
      });

      supabase.from.mockReturnValue({
        update: mockUpdate, // from() retorna objeto con update()
      });

      // Enviar petición PUT
      const res = await request(app).put("/api/diets/1").send(updateData);

      // Verificar actualización exitosa
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
      // Mock: supabase.from('diets').delete().eq('id', id).select('name').single()
      const mockSingle = jest.fn().mockResolvedValue({
        data: { name: "Dieta Eliminada" }, // Solo retorna el nombre
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle, // select() retorna objeto con single()
      });

      const mockEq = jest.fn().mockReturnValue({
        select: mockSelect, // eq() retorna objeto con select()
      });

      const mockDelete = jest.fn().mockReturnValue({
        eq: mockEq, // delete() retorna objeto con eq()
      });

      supabase.from.mockReturnValue({
        delete: mockDelete, // from() retorna objeto con delete()
      });

      // Enviar petición DELETE
      const res = await request(app).delete("/api/diets/1");

      // Verificar eliminación exitosa
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Dieta eliminada correctamente"
      );
    });
  });
});
