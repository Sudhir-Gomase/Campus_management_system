const knex = require("../../database-connections/campus_db/index.js");
const logger = require("../../../../src/utils/logger.js");

const getUser = async (email) => {
  try {
    const user = await knex("admin").where("email", email).first();
    return user || null; // explicitly return null if not found
  } catch (err) {
    logger.error(
      `REPOSITORY :: ADMIN :: getUser :: ERROR for email: ${email}`,
      err
    );
    throw new Error("Database query failed");
  }
};

module.exports = getUser;
