const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bancosolar",
  password: "root",
  port: 5432,
  // cuantas personas entra
  max: 20,
  min: 0,
  //tiempo de espera de inactividad
  idleTimeoutMillis: 5000,
  //tiempo de espera para entrar
  connectionTimeoutMillis: 2000,
});


const POSTUsuario = async (usuario) => {
  const values = Object.values(usuario);
  const consulta = {
    text: "INSERT INTO usuarios(nombre,balance) values ( $1, $2) RETURNING *",
    values,
  };
  try {
    const result = await pool.query(consulta);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const GETsuarios = async () => {
  const consulta = {
    text: "SELECT * FROM usuarios",
  };
  try {
    const result = await pool.query(consulta);
    return result.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const DELETEusuarios = async (id) => {
  const consulta = {
    text: "delete from usuarios where id = $1",
    values: [id],
  };
  try {
    await pool.query(consulta);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const PUTusuarios = async (user, id) => {
  const values = Object.values(user);
  values.push(id);

  const consulta = {
    text: "UPDATE usuarios SET nombre = $1, balance = $2 where id = $3 RETURNING *",
    values,
  };
  try {
    const result = await pool.query(consulta);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const HACERtransferencia = async (emisor, receptor, monto) => {
  const findUser = async (nameUser) => {
    try {
      const user = await pool.query(
        `SELECT * FROM usuarios WHERE nombre = '${nameUser}'`
      );
      return user;
    } catch (error) {
      throw error;
    }
  };
  try {
    const emisorFound = await findUser(emisor);
    const receptorFound = await findUser(receptor);

    if (!emisorFound.rows || !receptorFound.rows) {
      return false;
    }
    const { id: idEmisor } = emisorFound?.rows[0];

    const { id: idReceptor } = receptorFound?.rows[0];

    const agregarTRANS = {
      text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) values ( $1, $2, $3, $4) RETURNING *",
      values: [idEmisor, idReceptor, monto, new Date(Date.now())],
    };
    const consultaUPDATE = {
      text: `
    UPDATE usuarios
    SET balance = balance - $1
     WHERE nombre = $2;
    `,
      values: [monto, emisor],
    };
    const consultaUPDATE2 = {
      text: `
    UPDATE usuarios
    SET balance = balance + $1
     WHERE nombre = $2;
    `,
      values: [monto, receptor],
    };

    await pool.query("BEGIN;");

    await pool.query(consultaUPDATE);

    await pool.query(consultaUPDATE2);

    await pool.query("COMMIT;");

    const { rows } = await pool.query(agregarTRANS);

    return rows;
  } catch (error) {
    await pool.query("ROLLBACK;");
  }
};

const GEThiostorialtrans = async () => {
  const consulta = {
    text: "SELECT * FROM transferencias",
    rowMode: "array",
  };
  try {
    const result = await pool.query(consulta);
    return result.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const migrar = () => {
	const banco = fs.readFileSync(path.join(__dirname, "migracion.sql"), {
		encoding: "utf-8",
	});
	pool
		.query(banco)
		.then(() => console.log("migracion hecha"))
		.catch(console.error)
		.finally(() => pool.end());
};

module.exports = {
  POSTUsuario,
  GETsuarios,
  PUTusuarios,
  DELETEusuarios,
  HACERtransferencia,
  GEThiostorialtrans,
  migrar
};
