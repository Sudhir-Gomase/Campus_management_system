import { adminLoginController, departmentsController } from "../../service-layer/Controllers/Admin/index.js";

export default async function routes(fastify, options) {
  fastify.post("/adminlogin", {
    handler: adminLoginController,
  });

  fastify.get("/departments", {
    handler: departmentsController,
  });
}
