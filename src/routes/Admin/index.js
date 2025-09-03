const { adminLoginController } = require("../../service-layer/Controllers/Admin");

async function routes(fastify, options) {
  fastify.post("/adminlogin", {
    handler: adminLoginController,
  });
}
 
module.exports = routes;
