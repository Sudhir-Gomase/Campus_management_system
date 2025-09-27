import {
  studentloginService,
  studentProfileUpdateService,
  studentDataService,
  allCompanyListForStudentService,
  studentAppliedService,
  onGoingProcessService,
  studentChangePasswordService,
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
      return reply.status(400).send({
        success: false,
        error: "Invalid Credentials.",
      });
    }

    const { studentId, token, expireIN, email: userEmail, name, phone } = data;

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
        studentId,
        expireIn: expireIN,
        role: "student",
        email: userEmail,
        name,
        phone,
      },
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

    return reply.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("ERROR :: Student :: studentDataController", error);
    await getStatusCode(error, reply);
  }
};

export const studentProfileUpdateController = async (request, reply) => {
  try {
    const data = request?.body;
    const result = await studentProfileUpdateService(data);
    if(result==="Student not found"){
     return reply.status(200).send({
      success: false,
      message: "Student not found",
    });
    }

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Student profile updated successfully",
    });
  } catch (error) {
    logger.error("ERROR :: Student :: studentProfileUpdateController", error);
    await getStatusCode(error, reply);
  }
};

export const allCompanyListForStudentController = async (request, reply) => {
  try {
    const { id } = request?.params;
    const result = await allCompanyListForStudentService(id);

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Company list retrieved successfully",
    });
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
    const { student_id, company_id } = request?.body;
    console.log("student_id", student_id, company_id);
    const result = await studentAppliedService(student_id, company_id);

    return reply.status(201).send({
      success: true,
      data: result,
      message: "Application submitted successfully",
    });
  } catch (error) {
    logger.error("ERROR :: Student :: studentAppliedController", error);
    await getStatusCode(error, reply);
  }
};

export const onGoingProcessController = async (request, reply) => {
  try {
    const { student_id } = request?.params;
    const result = await onGoingProcessService(student_id);

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Ongoing processes retrieved successfully",
    });
  } catch (error) {
    logger.error("ERROR :: Student :: onGoingProcessController", error);
    await getStatusCode(error, reply);
  }
};

export const studentChangePasswordController = async (request, reply) => {
  try {
    const { studentId, currentPassword, newPassword } = request.body;

    // Validate required fields
    if (!studentId || !currentPassword || !newPassword) {
      return reply.status(400).send({
        success: false,
        error: "Student ID, current password, and new password are required",
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return reply.status(400).send({
        success: false,
        error: "New password must be at least 8 characters long",
      });
    }

    const result = await studentChangePasswordService(studentId, currentPassword, newPassword);

    if (result === "Invalid current password") {
      return reply.status(400).send({
        success: false,
        error: "Current password is incorrect",
      });
    }

    if (result === "Student not found") {
      return reply.status(404).send({
        success: false,
        error: "Student not found",
      });
    }

    return reply.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error("ERROR :: STUDENT :: studentChangePasswordController", error);
    await getStatusCode(error, reply);
  }
};
