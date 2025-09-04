import { studentloginService } from "../../Service/Student/index.js";
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

    const { student_id, token, expireIN, email: userEmail, name, phone } = data;

    if (!token) {
      return reply.code(500).send({ error: "Token generation failed" });
    }

    return reply.send({
      token,
      student_id,
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
