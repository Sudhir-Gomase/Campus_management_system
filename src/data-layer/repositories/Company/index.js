import knex from "../../database-connections/campus_db/connection.js";
import logger from "../../../../src/utils/logger.js";
import { only } from "node:test";
import { format } from "path";
import { exists } from "fs";

export const companyRegistration = async (data) => {
  try {
    // Check if company with same name already exists
    const existingCompany = await knex("companies")
      .where("name", data.name)
      .first();

    if (existingCompany) {
      throw new Error("Company with this name already exists");
    }

    let created_at = new Date();
    data.created_at = created_at;
    data.updated_at = created_at;
    const result = await knex("companies").insert(data);
    if (result) {
      return "Admin will get back to you soon after verification.";
    }
  } catch (error) {
    logger.error(
      "REPOSITORY :: COMPANY :: companyRegistration :: ERROR",
      error
    );
    throw error;
  }
};

export const companyLogin = async (data) => {
  try {
    const exists = await knex("companies")
      .where("username", data.username)
      .first();
    if (!exists) {
      throw new Error("Admin not approved yet");
    }
    const result = await knex("companies")
      .where("usernam`e", data.username)
      .andWhere("password", data.password)
      .first();

    if (!result) {
      throw new Error("Invalid username or password");
    }
    return "Company login successful";
  } catch (error) {
    logger.error("REPOSITORY :: COMPANY :: companyLogin :: ERROR", error);
    throw error;
  }
};

export const updateCompanyData = async (companyId, updateData) => {
  try {
    // Remove is_approved field if present to prevent unauthorized updates
    const { is_approved, ...sanitizedData } = updateData;

    // Add updated_at timestamp
    sanitizedData.updated_at = new Date();

    const result = await knex("companies")
      .where("company_id", companyId)
      .update(sanitizedData);

    if (result === 0) {
      throw new Error("Company not found or no changes made");
    }

    // Return updated company data
    const updatedCompany = await knex("companies")
      .where("company_id", companyId)
      .first();

    return updatedCompany;
  } catch (error) {
    logger.error("REPOSITORY :: COMPANY :: updateCompanyData :: ERROR", error);
    throw error;
  }
};

export const getCompanyById = async (companyId) => {
  try {
    const company = await knex("companies")
      .where("company_id", companyId)
      .first();

    if (!company) {
      throw new Error("Company not found");
    }

    return company;
  } catch (error) {
    logger.error("REPOSITORY :: COMPANY :: getCompanyById :: ERROR", error);
    throw error;
  }
};

export const getCompanyApplications = async (companyId) => {
  try {
    const applications = await knex("student_companies")
      .join("students", "student_companies.student_id", "students.student_id")
      .join(
        "departments",
        "students.department_id",
        "departments.department_id"
      )
      .where("student_companies.company_id", companyId)
      .select(
        "student_companies.id as application_id",
        "student_companies.placement_status",
        "student_companies.applied_at",
        "students.student_id",
        "students.full_name",
        "students.email",
        "students.phone",
        "students.roll_no",
        "students.marks_10th",
        "students.marks_12th",
        "students.marks_ug",
        "students.marks_pg",
        "students.expected_ctc",
        "students.gender",
        "students.dob",
        "students.ug_branch",
        "students.ug_college",
        "students.pg_branch",
        "students.pg_college",
        "students.backlogs",
        "students.gap_years",
        "students.technical_skills",
        "students.soft_skills",
        "students.certifications",
        "students.projects",
        "students.preferred_job_roles",
        "students.preferred_locations",
        "students.resume_url",
        "students.is_placed",
        "students.ctc",
        "departments.name as department_name",
        "departments.code as department_code"
      )
      .orderBy("student_companies.applied_at", "desc");

    return applications;
  } catch (error) {
    logger.error(
      "REPOSITORY :: COMPANY :: getCompanyApplications :: ERROR",
      error
    );
    throw error;
  }
};
