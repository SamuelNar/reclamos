CREATE TABLE reclamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    producto VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    importancia ENUM('alta', 'media', 'baja') NOT NULL,
    observaciones TEXT,
    estado ENUM('inactivo', 'activo', 'en proceso', 'finalizado', 'eliminado') NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    asignado varchar(100) NOT NULL
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'usuario') DEFAULT 'usuario',  -- admin o usuario
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO reclamos (nombre, producto, descripcion, importancia, estado, asignado) 
VALUES ('Reclamo ejemplo', 'camara', 'Descripción', 'alta', 'activo', 'Maxi');

select * from reclamos;
delete from usuarios where id = 1;