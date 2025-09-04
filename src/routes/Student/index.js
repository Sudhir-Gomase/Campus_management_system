import { studentLoginController } from "../../service-layer/Controllers/Student/index.js";

export default async function routes(fastify, options) {
  fastify.post("/studentlogin", {
    handler: studentLoginController,
  });
}