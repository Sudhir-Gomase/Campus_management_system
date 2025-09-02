const { loginService } = require("../../Service/Admin");
const { getStatusCode } = require("../../../utils/getStatusCode");
const logger = require("../../../utils/logger");
const axios = require("axios");


const adminLoginController = async (request, reply) => {
  try {
    console.log("route hit")
    const { email, password } = request.body;
    const data = await loginService(email, password);

    if (data === "user not found" || data === "password not matched") {
      return reply.code(400).send("Invalid Credentials.");
    }

    const userId = data.userId.toString();
    const token = data.token;

    if (!token) {
      return reply.code(500).send({ error: "Token generation failed" });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    try {
      // ⚠️ NOTE: You need to define/createToken, ipAddress, userAgent somewhere
      await createToken(userId, token, ipAddress, userAgent, expiresAt);

      return reply.send({
        token: token,
        userId: data.userId,
        accounts: data.accounts,
        expireIn: data.expireIN,
        message: "Login successful",
      });
    } catch (tokenError) {
      logger.error("ERROR :: Login :: Token Creation", tokenError);
      return reply.code(500).send({
        error: "Failed to create session. Please try again.",
      });
    }
  } catch (error) {
    logger.error("ERROR :: ACCOUNTS :: loginController", error);
    await getStatusCode(error, reply);
  }
};

module.exports = { adminLoginController };
