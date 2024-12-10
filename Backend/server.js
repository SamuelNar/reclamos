import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

// Configuración
const app = express();
const PORT = 3000;
const SECRET_KEY = "clave_secreta";

app.use(cors());
// Middleware
app.use(bodyParser.json());

const db = mysql.createPool({
  host: "mysqlspring.cve2cg4quyaq.sa-east-1.rds.amazonaws.com",
  user: "lidercom",
  password: "123lidercom456",
  database: "control",
});

const clientesDb = mysql.createPool({
  host: "mysqlspring.cve2cg4quyaq.sa-east-1.rds.amazonaws.com",
  user: "lidercom",
  password: "123lidercom456",
  database: "clientes",
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};

// Rutas de autenticación
app.post("/auth/register", async (req, res) => {
  const { username, email,password, rol } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username,email,password, rol) VALUES (?, ?, ?)",
      [username,email,hashedPassword, rol || "user"]
    );
    res
      .status(201)
      .json({ id: result.insertId, username, rol: rol || "user" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al registrar usuario", details: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE nombre = ?", [
      username,
    ]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({ message: "Inicio de sesión exitoso", token });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al iniciar sesión", details: error.message });
  }
});

app.post("/auth/logout", authenticateToken, (req, res) => {
  // Si necesitas mantener un registro de los tokens invalidados,
  // podrías almacenarlos en una lista de tokens bloqueados.
  
  res.status(200).json({ message: "Sesión cerrada exitosamente" });
});

app.get("/reclamos", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reclamos");
    res.status(200).json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener reclamos", details: error.message });
  }
});

app.get("/clientes", async (req, res) => {
  try {
    const [rows] = await clientesDb.query("SELECT * FROM cliente");
    res.status(200).json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener clientes", details: error.message });
  }
});

app.post("/reclamos", authenticateToken, async (req, res) => {
  const { 
    nombre, 
    producto, 
    productoPersonalizado, 
    descripcion, 
    descripcionPersonalizada, 
    importancia, 
    observaciones, 
    estado, 
    asignado, 
    cliente_id 
  } = req.body;

  // Validar campos obligatorios
  const finalProducto = producto === "otros" ? productoPersonalizado : producto;
  const finalDescripcion = descripcion === "otros" ? descripcionPersonalizada : descripcion;

  console.log(nombre, 
    producto, 
    productoPersonalizado, 
    descripcion, 
    descripcionPersonalizada, 
    importancia, 
    observaciones, 
    estado, 
    asignado, 
    cliente_id )
    
  if (
    !nombre || 
    !finalProducto || 
    !finalDescripcion || 
    !importancia || 
    !estado || 
    !asignado || 
    !cliente_id
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Insertar el reclamo en la base de datos
    const [result] = await db.query(
      `INSERT INTO reclamos (
        nombre, producto, descripcion, importancia, observaciones, estado, asignado, cliente_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, finalProducto, finalDescripcion, importancia, observaciones, estado, asignado, cliente_id]
    );

    // Responder con el nuevo reclamo creado
    res.status(201).json({
      id: result.insertId,
      nombre,
      producto: finalProducto,
      descripcion: finalDescripcion,
      importancia,
      observaciones,
      estado,
      asignado,
      cliente_id
    });
  } catch (error) {
    console.error("Error al crear reclamo:", error);
    res.status(500).json({ error: "Error al crear reclamo", details: error.message });
  }
});


app.put("/reclamos/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;  // Obtener el ID de los parámetros de la URL
  const { 
    nombre, 
    producto, 
    productoPersonalizado,
    descripcion, 
    descripcionPersonalizada,
    importancia, 
    observaciones,
    estado, 
    asignado,
    cliente_id 
  } = req.body;

  const finalProducto = producto === 'otros' ? productoPersonalizado : producto;
  
  // Usar descripcionPersonalizada si descripcion es "otros"
  const finalDescripcion = descripcion === 'otros' ? descripcionPersonalizada : descripcion;
  console.log(nombre, 
    producto, 
    productoPersonalizado,
    descripcion, 
    descripcionPersonalizada,
    importancia, 
    observaciones,
    estado, 
    asignado,
    cliente_id )
  if (!nombre || !finalProducto || !finalDescripcion || !importancia || !estado || !asignado) {
    return res.status(401).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [result] = await db.query(
      "UPDATE reclamos SET nombre = ?, producto = ?, descripcion = ?, importancia = ?, observaciones = ?, estado = ?, asignado = ?, cliente_id = ? WHERE id = ?",
      [nombre, finalProducto, finalDescripcion, importancia, observaciones,estado, asignado,cliente_id,id]
    );

    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }

    res.status(200).json({
      id,
      nombre,
      producto: finalProducto,
      descripcion: finalDescripcion,
      importancia,
      estado,
      asignado
    });
  } catch (error) {
    console.error("Error al actualizar reclamo:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar reclamo", details: error.message });
  }
});

app.put("/reclamos/:id/eliminar", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("UPDATE reclamos SET estado = 'eliminado' WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }

    res.status(200).json({ message: "Reclamo eliminado" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar reclamo", details: error.message });
  }
});

app.put("/reclamos/:id/observaciones", async (req, res) => {
  const { id } = req.params;
  const { observaciones } = req.body; // Get observaciones from request body

  try {
    const [result] = await db.query("UPDATE reclamos SET observaciones = ? WHERE id = ?", [observaciones, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }

    res.status(200).json({ message: "Reclamo modificado" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al modificar reclamo", details: error.message });
  }
});

app.patch("/reclamos/:id/estado", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  // Validar que se proporcione un estado
  if (!estado) {
    return res.status(400).json({ error: "El estado es obligatorio" });
  }

  try {
    const [result] = await db.query(
      "UPDATE reclamos SET estado = ? WHERE id = ?",
      [estado, id]
    );

    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }

    res.status(200).json({
      id,
      message: "Estado del reclamo actualizado exitosamente",
      nuevoEstado: estado
    });
  } catch (error) {
    console.error("Error al actualizar el estado del reclamo:", error);
    res.status(500).json({ 
      error: "Error al actualizar el estado del reclamo", 
      details: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
