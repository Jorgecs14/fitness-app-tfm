const request = require("supertest");
const express = require("express");

jest.mock("../database/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: jest.fn(),
      },
    },
    from: jest.fn(),
  },
}));

const { supabase, supabaseAdmin } = require("../database/supabaseClient");
const usersRouter = require("../routes/users");
const app = express();
app.use(express.json());
app.use("/api/users", usersRouter);

describe("Users API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users", () => {
    test("debería retornar lista de usuarios exitosamente", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "Juan",
          surname: "Pérez",
          email: "juan@example.com",
          role: "client",
        },
        {
          id: 2,
          name: "María",
          surname: "García",
          email: "maria@example.com",
          role: "trainer",
        },
      ];

      const mockOrder = jest.fn().mockResolvedValue({
        data: mockUsers,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });

      const res = await request(app).get("/api/users");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUsers);
      expect(supabase.from).toHaveBeenCalledWith("users");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("id");
    });

    test("debería retornar 500 en caso de error en la base de datos", async () => {
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

      const res = await request(app).get("/api/users");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Error al obtener usuarios");
    });
  });

  describe("GET /api/users/:id", () => {
    test("debería retornar un usuario específico cuando se encuentra", async () => {
      const mockUser = {
        id: 1,
        name: "Juan",
        surname: "Pérez",
        email: "juan@example.com",
        role: "client",
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUser,
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

      const res = await request(app).get("/api/users/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUser);
    });

    test("debería retornar 404 cuando el usuario no se encuentra", async () => {
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

      const res = await request(app).get("/api/users/999");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Usuario no encontrado");
    });
  });

  describe("POST /api/users", () => {
    test("debería crear un nuevo usuario con datos válidos", async () => {
      const newUser = {
        name: "Carlos",
        surname: "López",
        email: "carlos@example.com",
        password: "password123",
        birth_date: "1990-01-01",
      };

      const mockAuthUser = {
        user: { id: "auth-789", email: "carlos@example.com" },
      };

      const createdUser = {
        id: 3,
        auth_user_id: "auth-789",
        name: "Carlos",
        surname: "López",
        email: "carlos@example.com",
        birth_date: "1990-01-01",
        role: "client",
      };

      supabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: mockAuthUser,
        error: null,
      });

      const mockSingle = jest.fn().mockResolvedValue({
        data: createdUser,
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

      const res = await request(app).post("/api/users").send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        name: "Carlos",
        email: "carlos@example.com",
      });
    });

    test("debería retornar 400 cuando faltan campos requeridos", async () => {
      const incompleteUser = {
        name: "Test User",
      };

      const res = await request(app).post("/api/users").send(incompleteUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Faltan campos requeridos (email, password, name, surname, birth_date)"
      );
    });

    test("debería retornar 500 para email duplicado", async () => {
      const newUser = {
        name: "Juan",
        surname: "Pérez",
        email: "existing@example.com",
        password: "password123",
        birth_date: "1985-05-15",
      };

      supabaseAdmin.auth = {
        admin: {
          createUser: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "User already registered" },
          }),
        },
      };

      const res = await request(app).post("/api/users").send(newUser);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Error al crear usuario");
    });
  });

  describe("PUT /api/users/:id", () => {
    test("debería actualizar un usuario con datos válidos", async () => {
      const updateData = {
        name: "Juan Updated",
        surname: "Pérez Updated",
        email: "john.updated@example.com",
      };

      const updatedUser = { id: 1, ...updateData, role: "client" };

      const mockSingle = jest.fn().mockResolvedValue({
        data: updatedUser,
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

      const res = await request(app).put("/api/users/1").send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject(updateData);
    });

    test("debería manejar actualizaciones parciales", async () => {
      const partialUpdate = {
        name: "Test",
      };

      const updatedUser = {
        id: 1,
        name: "Test",
        surname: null,
        email: null,
        role: "client",
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: updatedUser,
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

      const res = await request(app).put("/api/users/1").send(partialUpdate);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name", "Test");
    });
  });

  describe("DELETE /api/users/:id", () => {
    test("debería eliminar un usuario exitosamente", async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { email: "deleted@example.com" },
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

      const res = await request(app).delete("/api/users/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Usuario deleted@example.com eliminado correctamente"
      );
    });

    test("debería retornar 404 cuando el usuario no existe", async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
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

      const res = await request(app).delete("/api/users/999");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Usuario no encontrado");
    });
  });
});
