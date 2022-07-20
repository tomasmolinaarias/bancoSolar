const http = require("http");
const fs = require("fs");
const puerto = 3000;
const {
  POSTUsuario,
  GETsuarios,
  PUTusuarios,
  DELETEusuarios,
  HACERtransferencia,
  GEThiostorialtrans,
} = require("./database/config.js");

const url = require("url");

const server = http.createServer(async (req, res) => {
  //leer html

  if (req.url === "/" && req.method == "GET") {
    fs.readFile("index.html", (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end();
      } else {
        res.setHeader("Content-Type", "text/html");
        res.end(data);
      }
    });
  }

  //agregar usuarios

  if (req.url === "/usuario" && req.method == "POST") {
    let body = "";
    req.on("data", (chunck) => {
      body += chunck.toString();
    });
    req.on("end", async () => {
      const usuarios = JSON.parse(body);
      try {
        const resultado = await POSTUsuario(usuarios);
        res.statusCode = 201;
        res.end(JSON.stringify(resultado));
      } catch (error) {
        res.statusCode = 500;
        res.end("Ocurrio un error en el servidor", error);
      }
    });
  }

  // leer usuarios

  if (req.url === "/usuarios" && req.method == "GET") {
    try {
      const usuarios = await GETsuarios();
      res.end(JSON.stringify(usuarios));
    } catch (error) {
      res.statusCode = 500;
      res.end("Ocurrio un error en el servidor", error);
    }
  }

  //   editar usuarios

  if (req.url.startsWith("/usuario") && req.method == "PUT") {
    let body = "";

    req.on("data", (chunck) => {
      body += chunck.toString();
    });

    req.on("end", async () => {
      const usuarios = JSON.parse(body);
      try {
        let { id } = url.parse(req.url, true).query;
        const resultado = await PUTusuarios(usuarios, id);
        res.statusCode = 200;
        res.end(JSON.stringify(resultado, id));
      } catch (error) {
        res.statusCode = 500;
        res.end("Ocurrio un error en el servidor", error);
      }
    });
  }

  //eliminar usuarios

  if (req.url.startsWith("/usuario") && req.method == "DELETE") {
    try {
      let { id } = url.parse(req.url, true).query;
      await DELETEusuarios(id);
      res.end("usuarios eliminado");
    } catch (error) {
      res.statusCode = 500;
      res.end(error);
      console.log("🚀 ~ file: index.js ~ line 85 ~ server ~ error", error);
    }
  }

  // agregar y hacer  transferencia

  if (req.url === "/transferencia" && req.method == "POST") {
    let body = "";
    req.on("data", (chunck) => {
      body += chunck.toString();
    });
    req.on("end", async (emisor, receptor, monto) => {
      const datos = JSON.parse(body);
      try {
        const resultado = await HACERtransferencia(
          datos.emisor,
          datos.receptor,
          datos.monto
        );

        res.statusCode = 201;
        res.end(JSON.stringify(resultado), console.log("listo"));
      } catch (error) {
        res.statusCode = 500;
        res.end("Ocurrio un error en el servidor", error);
      }
    });
  }

  // leer tabla

  if (req.url === "/transferencias" && req.method == "GET") {
    try {
      const registros = await GEThiostorialtrans();
      res.end(JSON.stringify(registros));
    } catch (error) {
      res.statusCode = 500;
      res.end("Ocurrio un error en el servidor", error);
    }
  }
});
server.listen(puerto, () => console.log("ServerON🟢"));
