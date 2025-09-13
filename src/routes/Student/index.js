import {
  studentLoginController,
  studentProfileUpdateController,
  studentDataController,
  allCompanyListForStudentController,
} from "../../service-layer/Controllers/Student/index.js";

export default async function routes(fastify, options) {
  fastify.post("/studentlogin", {
    handler: studentLoginController,
  });

  fastify.get("/studentdata/:id", {
    handler: studentDataController,
  });

  fastify.post("/studentprofileupdate", {
    handler: studentProfileUpdateController,
  });

  fastify.get("/allcompanylistforstudent/:id", {
    handler: allCompanyListForStudentController,
  });
}
