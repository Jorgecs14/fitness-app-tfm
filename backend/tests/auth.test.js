const request = require("supertest");
const express = require("express");

// Mock Supabase antes de importar el middleware
// Esto es CRÍTICO: debe estar antes de cualquier import que use Supabase
jest.mock("../database/supabaseClient", () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(), // Simula el método getUser de Supabase Auth
    },
    from: jest.fn(), // Simula el método from para queries de BD
  },
}));

// Ahora sí importamos (después del mock)
const { supabaseAdmin } = require("../database/supabaseClient");
const { authenticateToken } = require("../middleware/auth");

// Crear app de prueba minimalista
const app = express();
app.use(express.json()); // Para parsear JSON en requests

// Ruta de prueba que usa el middleware de autenticación
app.get("/test-auth", authenticateToken, (req, res) => {
  res.json({ message: "Authenticated", user: req.user });
});

describe("Authentication Middleware", () => {
  // Limpia todos los mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debería retornar 401 cuando no hay token", async () => {
    // Hace petición sin header Authorization
    const res = await request(app).get("/test-auth");

    // Verifica respuesta esperada
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Token de acceso requerido");
  });

  test("debería retornar 403 cuando el token es inválido", async () => {
    // Mock: Simula que Supabase no puede validar el token
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Invalid token"),
    });

    // Hace petición con token inválido
    const res = await request(app)
      .get("/test-auth")
      .set("Authorization", "Bearer invalidtoken");

    // Verifica que se rechace correctamente
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Token inválido o expirado");
  });

  test("debería permitir acceso con token válido", async () => {
    // Datos simulados del usuario autenticado
    const mockAuthUser = {
      id: "auth-123",
      email: "test@example.com",
    };

    // Datos simulados del usuario en la BD
    const mockDbUser = {
      id: 1,
      auth_user_id: "auth-123",
      email: "test@example.com",
      name: "Test",
      role: "client",
    };

    // Mock 1: Simula que el token es válido
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    // Mock 2: Simula la búsqueda del usuario en la BD
    // Nota: mockReturnThis() permite encadenar métodos
    supabaseAdmin.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: mockDbUser,
        error: null,
      }),
    });

    // Hace petición con token válido
    const res = await request(app)
      .get("/test-auth")
      .set("Authorization", "Bearer validtoken");

    // Verifica éxito
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Authenticated");
  });

  test("debería crear un nuevo usuario si no existe en la base de datos", async () => {
    const mockAuthUser = {
      id: "auth-456",
      email: "newuser@example.com",
      user_metadata: {},
    };

    const mockNewDbUser = {
      id: 2,
      auth_user_id: "auth-456",
      email: "newuser@example.com",
      name: "",
      surname: "",
      role: "client",
    };

    // Simular autenticación exitosa
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    // Simular consulta a la base de datos - usuario no encontrado
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockMaybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    // Simular inserción de nuevo usuario
    const mockInsert = jest.fn().mockReturnThis();
    const mockInsertSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockNewDbUser,
      error: null,
    });

    supabaseAdmin.from.mockImplementation((table) => {
      if (table === "users") {
        return {
          select: mockSelect,
          eq: mockEq,
          maybeSingle: mockMaybeSingle,
          insert: mockInsert,
          single: mockSingle,
        };
      }
    });

    const res = await request(app)
      .get("/test-auth")
      .set("Authorization", "Bearer validtoken");

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("newuser@example.com");
  });

  test("debería devolver 401 cuando la cabecera de autorización está mal formada", async () => {
    const res = await request(app)
      .get("/test-auth")
      .set("Authorization", "InvalidFormat");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Token de acceso requerido");
  });
});
