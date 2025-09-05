import { adminloginService,
  departmentsService,
  academicYearDataService,
  companyListService,
  donutGraphDataService,
  downloadTemplateService} from "../../Service/Admin/index.js";
import fs from "fs";
import { getStatusCode } from "../../../utils/getStatusCode.js";
import logger from "../../../utils/logger.js";
import axios from "axios";
import { createObjectCsvWriter } from "csv-writer";

export const adminLoginController = async (request, reply) => {
  try {
    console.log("route hit done");

    const { email, password } = request.body;
    const data = await adminloginService(email, password);
    
    if (data === "user not found" || data === "password not matched") {
      return reply.code(400).send({ error: "Invalid Credentials." });
    }

    const { admin_id, token, expireIN, role, email: userEmail, name, phone } = data;

    if (!token) {
      return reply.code(500).send({ error: "Token generation failed" });
    }

    return reply.send({
      token,
      admin_id,
      expireIn: expireIN,
      role,
      email: userEmail,
      name,
      phone,
      message: "Login successful",
    });

  } catch (error) {
    logger.error("ERROR :: ADMIN :: loginController", error);
    await getStatusCode(error, reply);
  }
};

export const departmentsController = async (request, reply) => {
  try {
    const { id } = request.query;  // ✅ read query string param
    const data = await departmentsService(id); // pass id to service
    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: A :: departmentsController", error);
    await getStatusCode(error, reply);
  }
};

export const academicYearDataController  = async (request, reply) => {
  try {
    const {year, department_id,company_id,status } = request.query;  
    const data = await academicYearDataService(year,department_id,company_id,status); 
    if (typeof data === 'string' && data.startsWith('No data')) {
      reply.code(400).send(data);   // or res.status/ h.response depending on framework
    }
     if (typeof data === 'string' && data.startsWith('No students found')) {
      reply.code(400).send(data);   // or res.status/ h.response depending on framework
    }


    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: ADMIN :: academicYearDataController", error);
    await getStatusCode(error, reply);
  }
};

export const companylistController  = async (request, reply) => {
  try {
    const { id } = request.query;  
    const data = await companyListService(id); 
    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: ADMIN :: companylistController", error);
    await getStatusCode(error, reply);
  }
};



export const donutGraphDataController  = async (request, reply) => {
  try {
    const {department_id } = request.query;  
    const data = await donutGraphDataService(department_id); 
    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: ADMIN :: donutGraphDataController", error);
    await getStatusCode(error, reply);
  }
};


export const downloadTemplateController  = async (request, reply) => {
  try {
    const filePath = await downloadTemplateService();
    reply.header("Content-Disposition", "attachment; filename=example.csv");
    reply.header("Content-Type", "text/csv");
    const buffer = fs.readFileSync(filePath);
    fs.unlinkSync(filePath);
    reply.send(buffer);
  } catch (error) {
    logger.error("ERROR :: ADMIN :: downloadTemplateController", error);
    await getStatusCode(error, reply);
  }
};