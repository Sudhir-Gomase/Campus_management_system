import {
  studentloginService,
  studentProfileUpdateService,
  studentDataService,
  allCompanyListForStudentService,
  studentAppliedService
} from "../../Service/Student/index.js";
import { getStatusCode } from "../../../utils/getStatusCode.js";
import logger from "../../../utils/logger.js";
import axios from "axios";

export const studentLoginController = async (request, reply) => {
  try {
    console.log("route hit done");

    const { email, password } = request.body;
    const data = await studentloginService(email, password);

    console.log("data", data);

    if (data === "user not found" || data === "password not matched") {
      return reply.code(400).send({ error: "Invalid Credentials." });
    }

    const { studentId, token, expireIN, email: userEmail, name, phone } = data;

    if (!token) {
      return reply.code(500).send({ error: "Token generation failed" });
    }

    return reply.send({
      token,
      studentId,
      expireIn: expireIN,
      role: "student",
      email: userEmail,
      name,
      phone,
      message: "Login successful",
    });
  } catch (error) {
    logger.error("ERROR :: ACCOUNTS :: studentLoginController", error);
    await getStatusCode(error, reply);
  }
};

export const studentDataController = async (request, reply) => {
  try {
    let { id } = request?.params;
    console.log("id", id);
    const result = await studentDataService(id);
    return result;
  } catch (error) {
    logger.error("ERROR :: Student :: studentDataController", error);
    await getStatusCode(error, reply);
  }
};

export const studentProfileUpdateController = async (request, reply) => {
  try {
    const data = request?.body;
    const result = await studentProfileUpdateService(data);
    return result;
  } catch (error) {
    logger.error("ERROR :: Student :: studentDataController", error);
    await getStatusCode(error, reply);
  }
};

export const allCompanyListForStudentController = async (request, reply) => {
  try {
    const { id } = request?.params;
    const result = await allCompanyListForStudentService(id);
    return result;
  } catch (error) {
    logger.error(
      "ERROR :: Student :: allCompanyListForStudentController",
      error
    );
    await getStatusCode(error, reply);
  }
};



export const studentAppliedController = async (request, reply) => {
  try {
    const {student_id ,company_id}  = request?.body;
    console.log("student_id",student_id,company_id);
    const result = await studentAppliedService(student_id,company_id);
    return result;
  } catch (error) {
    logger.error(
      "ERROR :: Student :: studentappliedController",
      error
    );
    await getStatusCode(error, reply);
  }
};
