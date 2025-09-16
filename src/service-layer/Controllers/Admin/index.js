import {
  adminloginService,
  departmentsService,
  academicYearDataService,
  companyListService,
  donutGraphDataService,
  downloadTemplateService,
  registerBulkEmployeeService,
  addstudentService,
  overallCompanyDataService,
  overallCompanyDataUpdateService,
  deleteStudentService,
  adminDataUpdateService
} from "../../Service/Admin/index.js";
import fastifyMultipart from "@fastify/multipart";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
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

    const {
      adminId,
      token,
      expireIN,
      role,
      email: userEmail,
      name,
      phone,
    } = data;

    if (!token) {
      return reply.code(500).send({ error: "Token generation failed" });
    }

    return reply.send({
      token,
      adminId,
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
    const { id } = request.query; // ✅ read query string param
    const data = await departmentsService(id); // pass id to service
    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: A :: departmentsController", error);
    await getStatusCode(error, reply);
  }
};

export const academicYearDataController = async (request, reply) => {
  try {
    const { year, department_id, company_id, status } = request.query;
    const data = await academicYearDataService(
      year,
      department_id,
      company_id,
      status
    );
    if (typeof data === "string" && data.startsWith("No data")) {
      reply.code(400).send(data); // or res.status/ h.response depending on framework
    }
    if (typeof data === "string" && data.startsWith("No students found")) {
      reply.code(400).send(data); // or res.status/ h.response depending on framework
    }

    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: ADMIN :: academicYearDataController", error);
    await getStatusCode(error, reply);
  }
};

export const companylistController = async (request, reply) => {
  try {
    const { id } = request.query;
    const data = await companyListService(id);
    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: ADMIN :: companylistController", error);
    await getStatusCode(error, reply);
  }
};

export const donutGraphDataController = async (request, reply) => {
  try {
    const { department_id } = request.query;
    const data = await donutGraphDataService(department_id);
    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: ADMIN :: donutGraphDataController", error);
    await getStatusCode(error, reply);
  }
};

export const downloadTemplateController = async (request, reply) => {
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

export const registerBulkEmployeeController = async (request, reply) => {
  try {
    const { department_id } = request?.params;
    const file = await request.file();

    if (!file) {
      return reply.status(400).send({ message: "No file uploaded" });
    }

    const results = [];
    const errors = [];

    // Read uploaded file into buffer
    const fileBuffer = await file.toBuffer();

    // Parse CSV with normalized headers
    await new Promise((resolve, reject) => {
      Readable.from(fileBuffer)
        .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
        .on("data", (row) => results.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    let successCount = 0;
    const employees = []; // ✅ use array to collect rows

    for (const [index, emp] of results.entries()) {
      try {
        const email = emp.email;
        const rollno = emp.rollno;

        // Skip blank rows
        if ((!email || !rollno) && Object.values(emp).every((v) => !v)) {
          continue;
        }

        if (!email || !rollno) {
          throw new Error(`Row ${index + 1}: Missing required fields`);
        }

        employees.push({
          email: email.trim(),
          roll_no: rollno.trim(),
          department_id: Number(department_id),
        });

        successCount++;
      } catch (err) {
        errors.push({
          row: index + 1,
          email: emp.email,
          rollno: emp.rollno,
          error: err.message,
        });
        logger.error("Bulk employee insert error", err);
      }
    }

    // ✅ call service with full array
    await registerBulkEmployeeService(employees);

    return reply.send({
      total: results.length,
      success: successCount,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    logger.error("ERROR :: ADMIN :: registerBulkEmployeeController", error);
    await getStatusCode(error, reply);
  }
};

export const addStudentController = async (request, reply) => {
  try {
    const record = request?.body;
    const data = await addstudentService(record);
    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: ADMIN :: addStudentController", error);
    await getStatusCode(error, reply);
  }
};

export const overallCompanyDataController = async (request, reply) => {
  try { 
    const { is_approved } = request?.query;
    const data = await overallCompanyDataService(is_approved);
    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: ADMIN :: overallCompanyDataController", error);
    await getStatusCode(error, reply);
  }
};

export const overallCompanyDataUpdateController = async (request, reply) => {
  try {
    const { company_id, is_approved } = request?.params;
    const result = await overallCompanyDataUpdateService(
      company_id,
      is_approved
    );
    if (!result || result.success === false) {
      return reply.code(404).send({
        success: false,
        message: result?.message || "Data not updated",
      });
    }
    return reply.send({
      success: true,
      message: result.message,
      ...(result.credentials ? { credentials: result.credentials } : {}), // only send if created
    });
  } catch (err) {
    logger.error("ERROR :: ADMIN :: overallCompanyDataUpdateController", error);
    await getStatusCode(err, reply);
  }
};

export const deleteStudentController = async (request, reply) => {
  try {
    const { student_id } = request?.params;
    const data = await deleteStudentService(student_id);
    if (data === 1) {
      return reply.send("Data is Deleted successfully.");
    } else {
      return reply.send("Data is not Deleted successfully.");
    }
  } catch (error) {
    logger.error("ERROR :: ADMIN :: deleteStudentController", error);
    await getStatusCode(error, reply);
  }
};



export const adminDataUpdateController = async (request, reply) => {
  try {
    const info   = request?.body;
    const data = await adminDataUpdateService(info);
    return data
  } catch (error) {
    logger.error("ERROR :: ADMIN :: adminDataUpdateController", error);
    await getStatusCode(error, reply);
  }
};