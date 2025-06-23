const express = require("express");
const router = express.Router();
const pool = require("../database/db");

router.get("/", async (req, res) => {
  try {
    console.log("GET /api/products - Obteniendo todos los productos");
    const result = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al buscar producto" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const result = await pool.query(
      "INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *",
      [name, description, price || "product"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    const result = await pool.query(
      "UPDATE products SET name = $1, description = $2, price = $3 RETURNING *",
      [name, description, price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING name",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({
      message: `Producto ${result.rows[0].email} eliminado correctamente`,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

module.exports = router;
