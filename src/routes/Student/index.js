import {
  studentLoginController,
  studentProfileUpdateController,
  studentDataController,
  allCompanyListForStudentController,
  studentAppliedController,
  onGoingProcessController
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

  fastify.get("/allcompanylistforstudent/:id", {  //student_id
    handler: allCompanyListForStudentController,
  });

  fastify.post("/studentapplied", {  
    handler: studentAppliedController,
  });

   fastify.get("/ongoingprocess/:student_id", {  //student_id
    handler: onGoingProcessController,
  });

}

