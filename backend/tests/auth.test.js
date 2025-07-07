const request = require("supertest");
const express = require("express");

// Mock Supabase antes de importar el middleware
// Esto es CRÍTICO: debe estar antes de cualquier import que use Supabase
jest.mock("../database/supabaseClient", () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(), 
  },
}));

const { supabaseAdmin } = require("../database/supabaseClient");
const { authenticateToken } = require("../middleware/auth");


const app = express();
app.use(express.json()); 

app.get("/test-auth", authenticateToken, (req, res) => {
  res.json({ message: "Authenticated", user: req.user });
});

describe("Authentication Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debería retornar 401 cuando no hay token", async () => {
    const res = await request(app).get("/test-auth");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Token de acceso requerido");
  });

  test("debería retornar 403 cuando el token es inválido", async () => {
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Invalid token"),
    });

    const res = await request(app)
      .get("/test-auth")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Token inválido o expirado");
  });

  test("debería permitir acceso con token válido", async () => {
    const mockAuthUser = {
      id: "auth-123",
      email: "test@example.com",
    };

    const mockDbUser = {
      id: 1,
      auth_user_id: "auth-123",
      email: "test@example.com",
      name: "Test",
      role: "client",
    };

 
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    supabaseAdmin.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: mockDbUser,
        error: null,
      }),
    });


    const res = await request(app)
      .get("/test-auth")
      .set("Authorization", "Bearer validtoken");

  
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

    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockMaybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

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
