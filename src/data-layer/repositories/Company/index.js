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
      .where("username", data.username)
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
    // Get all students who applied to this company with their details
    const applications = await knex("student_companies as sc")
      .join("students as s", "sc.student_id", "s.student_id")
      .join("departments as d", "s.department_id", "d.department_id")
      .where("sc.company_id", companyId)
      .select(
        "sc.student_id",
        "sc.company_id",
        "sc.placement_status",
        "sc.applied_at",
        "s.full_name",
        "s.email",
        "s.phone",
        "s.roll_no",
        "s.marks_10th",
        "s.marks_12th",
        "s.marks_ug",
        "s.marks_pg",
        "s.backlogs",
        "s.gap_years",
        "s.resume_url",
        "d.name as department_name",
        "d.code as department_code"
      )
      .orderBy("sc.applied_at", "desc");

    // Get application statistics
    const stats = await knex("student_companies")
      .where("company_id", companyId)
      .select("placement_status")
      .count("student_id as count")
      .groupBy("placement_status");

    const statistics = {
      total: applications.length,
      applied: 0,
      shortlisted: 0,
      interviewed: 0,
      selected: 0,
      rejected: 0,
      on_hold: 0,
    };

    stats.forEach((stat) => {
      if (statistics.hasOwnProperty(stat.placement_status)) {
        statistics[stat.placement_status] = stat.count;
      }
    });

    return {
      applications,
      statistics,
    };
  } catch (error) {
    logger.error(
      "REPOSITORY :: COMPANY :: getCompanyApplications :: ERROR",
      error
    );
    throw error;
  }
};

export const updateApplicationStatus = async (companyId, studentId, status) => {
  try {
    // Check if the application exists
    const existingApplication = await knex("student_companies")
      .where("company_id", companyId)
      .andWhere("student_id", studentId)
      .first();

    if (!existingApplication) {
      throw new Error("Application not found");
    }

    // Update the status
    const result = await knex("student_companies")
      .where("company_id", companyId)
      .andWhere("student_id", studentId)
      .update({
        placement_status: status,
        updated_at: new Date(),
      });

    if (result === 0) {
      throw new Error("Failed to update application status");
    }

    // Get updated application details
    const updatedApplication = await knex("student_companies as sc")
      .join("students as s", "sc.student_id", "s.student_id")
      .where("sc.company_id", companyId)
      .andWhere("sc.student_id", studentId)
      .select("sc.*", "s.full_name", "s.email", "s.roll_no")
      .first();

    return updatedApplication;
  } catch (error) {
    logger.error(
      "REPOSITORY :: COMPANY :: updateApplicationStatus :: ERROR",
      error
    );
    throw error;
  }
};
