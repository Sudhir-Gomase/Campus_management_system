import {
  companyRegistrationController,
  companyLoginController,
  updateCompanyProfileController,
  getCompanyProfileController,
  getCompanyApplicationsController,
  updateApplicationStatusController,
} from "../../service-layer/Controllers/Company/index.js";

export default async function routes(fastify, options) {
  // Company registration
  fastify.post("/companyregistration", {
    handler: companyRegistrationController,
  });

  // Company login
  fastify.post("/companylogin", {
    handler: companyLoginController,
  });

  // Get company profile
  fastify.get("/getcompany/:companyId", {
    handler: getCompanyProfileController,
  });

  // Update company profile (excluding is_approved field)
  fastify.put("/updatecompany/:companyId", {
    handler: updateCompanyProfileController,
  });

  // Get company applications (students who applied)
  fastify.get("/company/:companyId/applications", {
    handler: getCompanyApplicationsController,
  });

  // Update student application status
  fastify.put("/company/:companyId/application/:studentId/status", {
    handler: updateApplicationStatusController,
  });
}
