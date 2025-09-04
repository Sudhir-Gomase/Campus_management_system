import { adminloginService,departmentsService,academicYearDataService } from "../../Service/Admin/index.js";
import { getStatusCode } from "../../../utils/getStatusCode.js";
import logger from "../../../utils/logger.js";
import axios from "axios";

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
    logger.error("ERROR :: ACCOUNTS :: loginController", error);
    await getStatusCode(error, reply);
  }
};

export const departmentsController = async (request, reply) => {
  try {
    const { id } = request.query;  // ✅ read query string param
    const data = await departmentsService(id); // pass id to service
    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: ACCOUNTS :: departmentsController", error);
    await getStatusCode(error, reply);
  }
};

export const academicYearDataController
 = async (request, reply) => {
  try {
    const { id } = request.query;  // ✅ read query string param
    const data = await academicYearDataService(id); // pass id to service
    return reply.send(data);
  } catch (error) {
    logger.error("ERROR :: ACCOUNTS :: academicYearDataController", error);
    await getStatusCode(error, reply);
  }
};
