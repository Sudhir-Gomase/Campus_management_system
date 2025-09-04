import knex from "../../database-connections/campus_db/connection.js";
import logger from "../../../../src/utils/logger.js";

export const getUserForAdmin = async (email) => {
  try {
    const user = await knex("admin").where("email", email).first();
    return user || null; // explicitly return null if not found
  } catch (err) {
    logger.error(
      `REPOSITORY :: ADMIN :: getUser :: ERROR for email: ${email}`,
      err
    );
    // In JS, Error constructor only accepts one argument (message).
    // Pass err separately if you need to preserve stack/logging.
    throw new Error("Database query failed");
  }
};


export const department = async () => {
  try {
    const departments = await knex("departments").select("*");
    return departments; 
  } catch (err) {
    logger.error(
      `REPOSITORY :: ADMIN :: department :: ERROR`,
      err
    );
    throw new Error("Database query failed");
  }
};
