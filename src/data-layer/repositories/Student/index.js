import knex from "../../database-connections/campus_db/connection.js";
import logger from "../../../../src/utils/logger.js";
import { only } from "node:test";
import { format } from "path";

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
    console.log("student_id",student_id);

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



export const studentApplied = async (student_id, company_id) => {
  try {
    // 1. Check if student already applied
    const existing = await knex("student_companies")
      .where({ student_id, company_id })
      .first();

    if (existing) {
      return "Student already exists";
    }

    // 2. If not exists, insert new record
    const placement_status = "applied";
    const applied_at = new Date();

    const record = {
      student_id,
      company_id,
      placement_status,
      applied_at,
    };

    await knex("student_companies").insert(record);

    return "Student applied successfully";
  } catch (err) {
    logger.error(`SERVICE :: STUDENT :: studentApplied :: ERROR`, err);
    throw new Error("INTERNAL SERVER ERROR");
  }
};




export const onGoingProcess = async (student_id) => {
  try {
    const result = await knex("student_companies as sc")
      .join("companies as c", "sc.company_id", "c.company_id")
      .select(
        "sc.company_id",
        "sc.placement_status",
        "c.*"
      )
      .where("sc.student_id", student_id);

    return result;
  } catch (err) {
    logger.error(`SERVICE :: STUDENT :: onGoingProcess :: ERROR`, err);
    throw new Error("INTERNAL SERVER ERROR");
  }
};
