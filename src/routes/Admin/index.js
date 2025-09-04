import { adminLoginController, departmentsController,academicYearDataController } from "../../service-layer/Controllers/Admin/index.js";

export default async function routes(fastify, options) {
  fastify.post("/adminlogin", {
    handler: adminLoginController,
  });

  fastify.get("/departments", {
    handler: departmentsController,
  });

   fastify.get("/academicyeardata", {
    handler: academicYearDataController,
  });
}
