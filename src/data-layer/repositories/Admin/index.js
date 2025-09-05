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
    throw new Error("Database query failed");
  }
};


export const department = async (id) => {
  try {
    let departments;
    if (id) {
      // ✅ fetch single department by id
      departments = await knex("departments").select("*").where("department_id", id).first();
    } else {
      // ✅ fetch all departments
      departments = await knex("departments").select("*");
    }

    return departments;
  } catch (err) {
    logger.error(`REPOSITORY :: ADMIN :: department :: ERROR`, err);
    throw new Error("Database query failed");
  }
};

export const academicYearData = async (year, department_id, company_id, status) => {
  try {
    let data;

    // 🎓 1. Filter by academic year (from departments)
    if (year && !department_id && !company_id) {
      data = await knex("departments").select("*").where("academic_year", year);

      if (data.length === 0) {
        return `No data found for this ${year}`;
      }

      return data;
    }

    // 🏢 2. Filter by department + (optionally) company + status
    if (department_id) {
      // Build base query joining students with student_companies
      let query = knex("students as s")
        .select("s.*", "sc.company_id", "sc.placement_status")
        .leftJoin("student_companies as sc", "s.student_id", "sc.student_id")
        .where("s.department_id", department_id);

      if (company_id) {
        query = query.andWhere("sc.company_id", company_id);
      }

      if (status && status !== "all") {
        query = query.andWhere("sc.placement_status", status);
      }

      data = await query;

      if (data.length === 0) {
        return `No students found for given filters`;
      }

      return data;
    }

    return [];
  } catch (err) {
    logger.error(`REPOSITORY :: ADMIN :: academicYearData :: ERROR`, err);
    throw new Error("Database query failed");
  }
};




export const companyList = async (id) => {
  try {
    let companyList;
    if (id) {
      // ✅ fetch single department by id
      companyList = await knex("companies").select("*").where("company_id", id).first();
    } else {
      // ✅ fetch all departments
      companyList = await knex("companies").select("*");
    }
    return companyList;
  } catch (err) {
    logger.error(`REPOSITORY :: ADMIN :: companyList :: ERROR`, err);
    throw new Error("Database query failed");
  }
};


export const donutGraphData = async (department_id) => {
  try {
    const students = await knex("students").where("department_id", department_id)
    return students; 
  } catch (err) {
    logger.error(`REPOSITORY :: students :: donutGraphData :: `,err);
    throw new Error("Database query failed");
  }
};


export const donutGraphDataFromLinkage = async (student_id) => {
  try {
    const statuses = await knex("student_companies")
      .whereIn("student_id", student_id)
      .select("placement_status");
      return statuses
  } catch (err) {
    logger.error(`REPOSITORY :: students :: donutGraphDataFromLinkage :: `,err);
    throw new Error("Database query failed");
  }
};