// loginService.js
const {getUserForAdmin} = require("../../../data-layer/repositories/Admin/index.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../../../utils/logger.js");

const adminloginService = async (email, password) => {
  try {
    const user = await getUserForAdmin(email);
    console.log("user,user",user)
     console.log("email",email)
          console.log("password",password)
    if (!user) return "user not found";
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return "password not matched";
    }
    delete user.password;
    delete user.password_node;
    delete user.created_at;
    delete user.modified_at;
    delete user.onsite;
    const userPayload = {
      id: user.admin_id,
      email: user.email,
      role: user.role,
    };
    const secretBuffer = Buffer.from(process.env.JWT_SECRET_KEY || "secret-key");
    const token = jwt.sign(userPayload, secretBuffer, { expiresIn: 86400 }); // 24h

    return {
      userId: user.admin_id,
      accounts: [],
      token,
      expireIN: "24h",
    };
  } catch (err) {
    logger.error(`SERVICE :: USER :: login :: ERROR`, err);
    throw new Error("INTERNAL SERVER ERROR");
  }
};

module.exports = {adminloginService}; // ✅ correct CommonJS export
