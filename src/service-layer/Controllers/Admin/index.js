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
  adminDataUpdateService,
  searchStudentService,
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
      return reply.status(400).send({
        success: false,
        error: "Invalid Credentials.",
      });
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
      return reply.status(500).send({
        success: false,
        error: "Token generation failed",
      });
    }

    return reply.status(200).send({
      success: true,
      data: {
        token,
        adminId,
        expireIn: expireIN,
        role,
        email: userEmail,
        name,
        phone,
      },
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

    return reply.status(200).send({
      success: true,
      data: data,
      message: "Departments retrieved successfully",
    });
  } catch (error) {
    logger.error("ERROR :: ADMIN :: departmentsController", error);
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
      return reply.status(404).send({
        success: false,
        error: data,
      });
    }

    if (typeof data === "string" && data.startsWith("No students found")) {
      return reply.status(404).send({
        success: false,
        error: data,
      });
    }

    return reply.status(200).send({
      success: true,
      data: data,
      message: "Academic year data retrieved successfully",
    });
  } catch (error) {
    logger.error("ERROR :: ADMIN :: academicYearDataController", error);
    await getStatusCode(error, reply);
  }
};

export const companylistController = async (request, reply) => {
  try {
    const { id } = request.query;
    const data = await companyListService(id);

    return reply.status(200).send({
      success: true,
      data: data,
      message: "Company list retrieved successfully",
    });
  } catch (error) {
    logger.error("ERROR :: ADMIN :: companylistController", error);
    await getStatusCode(error, reply);
  }
};

export const donutGraphDataController = async (request, reply) => {
  try {
    const { department_id } = request.query;
    const data = await donutGraphDataService(department_id);

    return reply.status(200).send({
      success: true,
      data: data,
      message: "Donut chart data retrieved successfully",
    });
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

    return reply.status(201).send({
      success: true,
      data: {
        total: results.length,
        successCount: successCount,
        failedCount: errors.length,
        errors,
      },
      message: "Bulk employee registration completed",
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

    return reply.status(201).send({
      success: true,
      data: data,
      message: "Student added successfully",
    });
  } catch (error) {
    logger.error("ERROR :: ADMIN :: addStudentController", error);
    await getStatusCode(error, reply);
  }
};

export const overallCompanyDataController = async (request, reply) => {
  try {
    const { is_approved } = request?.query;
    const data = await overallCompanyDataService(is_approved);

    return reply.status(200).send({
      success: true,
      data: data,
      message: "Company data retrieved successfully",
    });
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
      return reply.status(404).send({
        success: false,
        error: result?.message || "Data not updated",
      });
    }

    return reply.status(200).send({
      success: true,
      data: result.credentials ? { credentials: result.credentials } : null,
      message: result.message,
    });
  } catch (error) {
    logger.error("ERROR :: ADMIN :: overallCompanyDataUpdateController", error);
    await getStatusCode(error, reply);
  }
};

export const deleteStudentController = async (request, reply) => {
  try {
    const { student_id } = request?.params;
    const data = await deleteStudentService(student_id);

    if (data === 1) {
      return reply.status(200).send({
        success: true,
        message: "Student deleted successfully",
      });
    } else {
      return reply.status(400).send({
        success: false,
        error: "Student deletion failed",
      });
    }
  } catch (error) {
    logger.error("ERROR :: ADMIN :: deleteStudentController", error);
    await getStatusCode(error, reply);
  }
};

export const adminDataUpdateController = async (request, reply) => {
  try {
    const info = request?.body;
    const data = await adminDataUpdateService(info);

    return reply.status(200).send({
      success: true,
      data: data,
      message: "Admin data updated successfully",
    });
  } catch (error) {
    logger.error("ERROR :: ADMIN :: adminDataUpdateController", error);
    await getStatusCode(error, reply);
  }
};

export const searchStudentController = async (request, reply) => {
  try {
    const { query } = request.query; // Can be name or roll number
    const data = await searchStudentService(query);

    if (!data || data.length === 0) {
      return reply.status(404).send({
        success: false,
        message: "No students found matching the search criteria",
      });
    }

    return reply.status(200).send({
      success: true,
      data: data,
      message: "Students retrieved successfully",
    });
  } catch (error) {
    logger.error("ERROR :: ADMIN :: searchStudentController", error);
    await getStatusCode(error, reply);
  }
};
