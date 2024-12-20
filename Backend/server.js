import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

// Configuración
const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET;;

app.use(cors());
// Middleware
app.use(bodyParser.json());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


const clientesDb = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME2,
});


const transporter = nodemailer.createTransport({
  host: process.env.HOST_EMAIL,
  port: process.env.PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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

app.patch("/changePassword/:id", async (req, res) => {
  const { id } = req.params;    
  const {password } = req.body;  

  if (!password) {
    return res.status(400).json({ error: "La contraseña es requerida" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  try { 
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "UPDATE usuarios SET password = ? WHERE id = ?",
      [hashedPassword,id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Contraseña cambiada con éxito" });    
  } catch (error) {
    console.error("Error detallado al cambiar contraseña:", error);
    res.status(500).json({ error: "Error al cambiar la contraseña", details: error.message });
  }
});

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
      { id: user.id,
        username: user.username,
        rol: user.rol,
        password: user.password,
        first_login: password === '123123'},
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

app.get("/reclamos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM reclamos WHERE cliente_id = ?", id);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }
    res.status(200).json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener reclamo", details: error.message });
  }
  }
)

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
app.get("/clientes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await clientesDb.query("SELECT * FROM cliente WHERE id = ?", id);
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
    cliente_id ,
    sector
  } = req.body;

  // Validar campos obligatorios
  const finalProducto = producto === "otros" ? productoPersonalizado : producto;
  const finalDescripcion = descripcion === "otros" ? descripcionPersonalizada : descripcion;
  if (
    !nombre || 
    !finalProducto || 
    !finalDescripcion || 
    !importancia || 
    !estado ||  
    !cliente_id
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Insertar el reclamo en la base de datos
    const [result] = await db.query(
      `INSERT INTO reclamos (
        nombre, producto, descripcion, importancia,observaciones, estado, asignado, cliente_id,sector
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, finalProducto, finalDescripcion, importancia,observaciones, estado, asignado, cliente_id,sector]
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'gdiaz@lidercom.net.ar', 
      subject: 'Nuevo Reclamo Registrado',
      text: `Se ha registrado un nuevo reclamo en el sistema con el nombre: ${nombre},
            el estado del reclamo es: ${estado} y la importancia es: ${importancia}.
            El producto es ${finalProducto} y la descripción es: ${finalDescripcion}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error al enviar el correo:', error);
      } else {
        console.log('Correo enviado:', info.response);
      }
    });

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
    cliente_id,
    sector
  } = req.body;

  const finalProducto = producto === 'otros' ? productoPersonalizado : producto;
  
  // Usar descripcionPersonalizada si descripcion es "otros"
  const finalDescripcion = descripcion === 'otros' ? descripcionPersonalizada : descripcion;
  if (!nombre || !finalProducto || !finalDescripcion || !importancia || !estado || !asignado) {
    return res.status(401).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [result] = await db.query(
      "UPDATE reclamos SET nombre = ?, producto = ?, descripcion = ?, importancia = ?, observaciones = ?, estado = ?, asignado = ?, cliente_id = ? , sector = ? WHERE id = ?",
      [nombre, finalProducto, finalDescripcion, importancia, observaciones,estado, asignado,cliente_id,sector,id]
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
      sector,
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

// Agregar firma al reclamo
app.put("/reclamos/:id/firma", async (req, res) => {
  const { firma } = req.body; // Firma en formato base64
  const reclamoId = req.params.id;

  if (!firma) {
    return res.status(400).json({ error: "Firma es requerida" });
  }

  try {
    const directory = "firmas";
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    // Convertir la firma base64 a un archivo
    const base64Data = firma.replace(/^data:image\/png;base64,/, "");
    const filePath = `${directory}/reclamo_${reclamoId}.png`;
    fs.writeFileSync(filePath, base64Data, "base64");    
    // Actualizar la base de datos con la ruta de la firma
    const [result] = await db.query(
      "UPDATE reclamos SET firma = ? WHERE id = ?",
      [filePath, reclamoId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'gdiaz@lidercom.net.ar', 
      subject: 'Reclamo finalizado',
      text: `Se ha finalizado un reclamo en el sistema con el nombre: ${nombre},
            la importancia es: ${importancia},el producto es ${finalProducto} con las siguientes 
            observaciones: ${observaciones}.` 
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error al enviar el correo:', error);
      } else {
        console.log('Correo enviado:', info.response);
      }
    });

    res.status(200).json({
      message: "Firma actualizada exitosamente",
      filePath,
    });
  } catch (error) {
    console.error("Error al guardar la firma:", error);
    res.status(500).json({
      error: "Error al guardar la firma",
      details: error.message,
    });
  }
});

app.get("/reclamos/firma/:cliente_id", async (req, res) => {
  const { cliente_id } = req.params; // Cambié "req.params.id" por "req.params.cliente_id"

  try {
    // Consultar la ruta de la firma en la base de datos usando el cliente_id
    const [rows] = await db.query("SELECT firma FROM reclamos WHERE cliente_id = ?", [cliente_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }

    const filePath = rows[0].firma;

    // Verificar si el archivo existe en el servidor
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Firma no encontrada en el servidor" });
    }

    // Enviar el archivo como respuesta al cliente
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("Error al obtener la firma:", error);
    res.status(500).json({
      error: "Error al obtener la firma",
      details: error.message,
    });
  }
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
