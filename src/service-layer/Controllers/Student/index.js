const { studentloginService } = require("../../Service/Student/index");
const { getStatusCode } = require("../../../utils/getStatusCode");
const logger = require("../../../utils/logger");
const axios = require("axios");


const studentLoginController = async (request, reply) => {
  try {
    console.log("route hit done")
    const { email, password } = request.body;
    const data = await studentloginService(email, password);
    console.log("data",data)
    if (data === "user not found" || data === "password not matched") {
      return reply.code(400).send("Invalid Credentials.");
    }
    const userId = data.student_id
    const token = data.token;
    if (!token) {
      return reply.code(500).send({ error: "Token generation failed" });
    }
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      return reply.send({
        token: token,
        student_id: data.student_id,
        expireIn: data.expireIN,
        role:"Student",
        message: "Login successful",
      });
    
  } catch (error) {
    logger.error("ERROR :: ACCOUNTS :: studentLoginController", error);
    await getStatusCode(error, reply);
  }
}

module.exports = { studentLoginController };
