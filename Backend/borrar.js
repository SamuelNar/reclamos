import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const secretKey = 'your_secret_key'; // Cambia esto a un secreto seguro

(async () => {
  const dbConfig = {
    host: 'mysqlspring.cve2cg4quyaq.sa-east-1.rds.amazonaws.com',
    user: 'lidercom',
    password: '123lidercom456',
    database: 'control',
  };

  const adminUser = {
    nombre: 'admin',
    email: 'admin@example.com',
    password: '123lidercom456',
    rol: 'admin',
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexión a la base de datos exitosa.');

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    // Insertar usuario en la base de datos
    const query = `
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES (?, ?, ?, ?)
    `;
    await connection.execute(query, [
      adminUser.nombre,
      adminUser.email,
      hashedPassword,
      adminUser.rol,
    ]);

    // Generar token JWT para el usuario
    const token = jwt.sign({ id: 1, role: 'admin' }, secretKey, { expiresIn: '1h' }); // ID ajustado según tu base

    console.log('Usuario administrador creado con éxito.');
    console.log('Token JWT:', token);

    await connection.end();
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error.message);
  }
})();
