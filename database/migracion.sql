-- CREAR LAS TABLAS
CREATE EXTENSION usuarios;
CREATE TABLE usuarios (
	id SERIAL PRIMARY KEY, 
	nombre VARCHAR(50),
	balance FLOAT CHECK (balance >= 0)
);
CREATE EXTENSION transferencias;
CREATE TABLE transferencias (
	id SERIAL PRIMARY KEY, 
	emisor INT,
	receptor INT,
	monto FLOAT,
	fecha TIMESTAMP, 
	FOREIGN KEY (emisor) REFERENCES usuarios(id),
	FOREIGN KEY (receptor) REFERENCES usuarios(id)
);



