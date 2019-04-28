const debug = require("debug")("app:routes:index");

const encryption = require("@base/encryption");

/*
const db = new (require("conf"))({
  configName: "db",
  cwd: "./"
});
*/

module.exports = app => {
  /*
   ** Controller
   */
  const controller = new class {
    constructor(app) {
      this.app = app;
    }

    async socket(socket, io, clients) {
      /*
      socket.on("announce", (meta, cb) => {
        debug("announce", clients);

        cb(clients);
      });
      */
    }

    async get(req, res, next) {
      //
      try {
        res.render("pages/index", {
          globals: {
            socket_clients: this.app.get("socket_clients"),
            token: encryption.hash("sha512", "123"),
            payment: {}
          }
        });
      } catch (err) {
        return next(err);
      }
    }
  }(app);

  /*
   ** Router & Routes
   */
  const { Router } = require("express");
  const router = Router();

  // GET /[options.apiPath [/options.apiVersion]]/
  router.get("/", (...args) => controller.get(...args));

  return {
    controller: controller,
    router: router
  };
};
