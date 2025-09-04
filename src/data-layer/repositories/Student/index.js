import knex from "../../database-connections/campus_db/connection.js";
import logger from "../../../../src/utils/logger.js";

export const getUserForStudent = async (email) => {
  try {
    const user = await knex("students").where("email", email).first();
    return user || null; // explicitly return null if not found
  } catch (err) {
    logger.error(
      `REPOSITORY :: STUDENT :: getUser :: ERROR for email: ${email}`,
      err
    );
    // Error constructor only accepts one message string
    throw new Error(`Database query failed: ${err.message}`);
  }
};
