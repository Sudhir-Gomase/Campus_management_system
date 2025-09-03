const {studentLoginController } = require("../../service-layer/Controllers/Student/index");

async function routes(fastify, options) {
  fastify.post("/studentlogin", {
    handler: studentLoginController,
  });
}
 
module.exports = routes;
