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


drop table cliente;
-- Crear la tabla cliente
CREATE TABLE cliente (
    id INT PRIMARY KEY,
    tipo_cliente ENUM('personaFisica', 'organizacion'),
    nombre VARCHAR(100),
    tipo_iva ENUM('responsableInscripto', 'monotributista', 'exento', 'consumidorFinal'),
    cuit VARCHAR(20),
    direccion VARCHAR(150),
    localidad VARCHAR(100),
    provincia VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(150)
);

INSERT INTO cliente (id, tipo_cliente, nombre, tipo_iva, cuit, direccion, localidad, provincia, telefono, email)
VALUES
    (3, 'organizacion', 'sanIgnacio', 'responsableInscripto', '.', '.', '.', '.', '.', '.'),
    (4, 'organizacion', 'navilli', 'responsableInscripto', '30-61840809-0', 'Estrada 624', 'Rio Cuarto', 'Cordoba', '3584018558', 'britos@puramel.com.ar'),
    (5, 'organizacion', 'indelma', 'responsableInscripto', '30-70780778-9', 'P Industrial Roberto Grosso', 'General Cabrera', 'Cordoba', '3585620698', 'etamburelli@insamani.com.ar - recepcionplanta@insa'),
    (6, 'organizacion', 'yacuray', 'responsableInscripto', '30-70941380-1', 'Avenida Santa Rosa 1727', 'Buenos Aires', 'Buenos Aires', '.', '.'),
    (7, 'organizacion', 'olega', 'responsableInscripto', '30-56842524-9', '.', 'CABA', 'Buenos Aires', '.', '.'),
    (8, 'organizacion', 'globoaves', 'responsableInscripto', '30-70872992-9', 'Tres Arroyos 400', 'Capital Federal', 'Buenos Aires', '1134350242', 'jfavre@gta.com.ar'),
    (9, 'organizacion', 'cotagro', 'responsableInscripto', '.', '.', '.', '.', '.', '.');