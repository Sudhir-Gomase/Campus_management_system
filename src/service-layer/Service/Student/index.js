import {
  getUserForStudent,
  studentData,
  studentProfileUpdate,
  allCompanyListForStudent,
} from "../../../data-layer/repositories/Student/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../../../utils/logger.js";

export const studentloginService = async (email, password) => {
  try {
    const user = await getUserForStudent(email);
    console.log("user", user);
    console.log("email", email);
    console.log("password", password);

    if (!user) return "user not found";

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return "password not matched";
    }

    // cleanup
    delete user.password;
    delete user.password_node;
    delete user.created_at;
    delete user.modified_at;
    delete user.onsite;

    // payload for JWT
    const userPayload = {
      id: user.student_id,
      email: user.email,
      role: user.role || "student",
    };

    const secretBuffer = Buffer.from(
      process.env.JWT_SECRET_KEY || "secret-key"
    );

    const token = jwt.sign(userPayload, secretBuffer, { expiresIn: "24h" });

    return {
      studentId: user.student_id,
      email: user.email,
      name: user.full_name,
      role: user.role || "student",
      phone: user.phone,
      token,
      expireIN: "24h",
    };
  } catch (err) {
    logger.error(`SERVICE :: STUDENT :: login :: ERROR`, err);
    throw new Error("INTERNAL SERVER ERROR");
  }
};

export const studentDataService = async (id) => {
  try {
    const result = await studentData(id);
    return result;
  } catch (err) {
    logger.error(`SERVICE :: STUDENT :: studentDataService :: ERROR`, err);
    throw new Error("INTERNAL SERVER ERROR");
  }
};

export const studentProfileUpdateService = async (data) => {
  try {
    const result = await studentProfileUpdate(data);
    return result;
  } catch (err) {
    logger.error(
      `SERVICE :: STUDENT :: studentProfileUpdateService :: ERROR`,
      err
    );
    throw new Error("INTERNAL SERVER ERROR");
  }
};

export const allCompanyListForStudentService = async (id) => {
  try {
    const result = await allCompanyListForStudent(id);
    return result;
  } catch (err) {
    logger.error(
      `SERVICE :: STUDENT :: allCompanyListForStudentService :: ERROR`,
      err
    );
    throw new Error("INTERNAL SERVER ERROR");
  }
};
