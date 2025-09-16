import {
  adminLoginController,
  departmentsController,
  academicYearDataController,
  companylistController,
  donutGraphDataController,
  downloadTemplateController,
  registerBulkEmployeeController,
  addStudentController,
  overallCompanyDataController,
  overallCompanyDataUpdateController,
  deleteStudentController,
  adminDataUpdateController
} from "../../service-layer/Controllers/Admin/index.js";

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

  fastify.get("/companylist", {
    handler: companylistController,
  });

  fastify.get("/donutgraphdata", {
    handler: donutGraphDataController,
  });

  fastify.get("/downloadtemplate", {
    handler: downloadTemplateController,
  });

  fastify.post("/registerbulkemployee/:department_id", {
    handler: registerBulkEmployeeController,
  });

  fastify.post("/addstudent", {
    handler: addStudentController,
  });

  fastify.get("/overallcompanydata", {
    handler: overallCompanyDataController,
  });

  fastify.put("/overallcompanydata/:company_id/:is_approved", {
    handler: overallCompanyDataUpdateController,
  });

  fastify.delete("/deletestudent/:student_id", {
    handler: deleteStudentController,
  });

    fastify.post("/admindataupdate/:admin_id", {
    handler: adminDataUpdateController,
  });


}
