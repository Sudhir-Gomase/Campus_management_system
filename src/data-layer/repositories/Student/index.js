import knex from "../../database-connections/campus_db/connection.js";
import logger from "../../../../src/utils/logger.js";
import { only } from "node:test";

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

export const studentData = async (id) => {
  try {
    // Fetch student details
    const student = await knex("students").where("student_id", id).first();

    if (!student) {
      throw new Error("Student not found");
    }

    // Fetch company data joined with student_companies
    const companyData = await knex("student_companies as sc")
      .join("companies as c", "sc.company_id", "c.company_id")
      .where("sc.student_id", id)
      .andWhere("c.is_approved", "true")
      .select(
        "c.*", // all company fields
        "sc.placement_status", // from student_companies
        "sc.applied_at" // if you have applied date
      );

    return {
      studentData: student,
      companyData: companyData,
    };
  } catch (err) {
    logger.error(`SERVICE :: STUDENT :: studentDataService :: ERROR`, err);
    throw new Error("INTERNAL SERVER ERROR");
  }
};

export const studentProfileUpdate = async (updateData) => {
  try {
    let id = updateData?.student_id;
    await knex("students").where("student_id", id).update(updateData);
    const updatedStudent = await knex("students")
      .where("student_id", id)
      .first();
    return updatedStudent;
  } catch (err) {
    logger.error(`SERVICE :: STUDENT :: studentDataService :: ERROR`, err);
    throw new Error("INTERNAL SERVER ERROR");
  }
};

export const allCompanyListForStudent = async (student_id) => {
  try {
    const companies = await knex("companies as c")
      .where("c.is_approved", "true") // only approved companies
      .whereNotIn(
        "c.company_id",
        knex("student_companies")
          .select("company_id")
          .where("student_id", student_id)
      )
      .select("c.*");

    return companies;
  } catch (err) {
    logger.error(
      `SERVICE :: STUDENT :: allCompanyListForStudent :: ERROR`,
      err
    );
    throw new Error("INTERNAL SERVER ERROR");
  }
};
