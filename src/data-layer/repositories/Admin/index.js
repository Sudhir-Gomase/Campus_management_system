import knex from "../../database-connections/campus_db/connection.js";
import logger from "../../../../src/utils/logger.js";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import securePassword from "secure-random-password";
export const generatePassword = () => {
  // Your password generation logic here
  // For simplicity, you can use a library like 'secure-random-password'
  // npm install secure-random-password
  return securePassword.randomPassword({
    length: 12,
    characters:
      securePassword.lower + securePassword.upper + securePassword.digits,
  });
};

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

export const registerBulkEmployee = async (employees) => {
  try {
    const hasTable = await knex.schema.hasTable("students");
    if (!hasTable) {
      throw new Error("Table 'students' does not exist");
    }

    const results = [];

    for (const emp of employees) {
      const { email, roll_no, department_id } = emp;

      // Check if student exists by roll_no or email within department
      const existing = await knex("students")
        .where("department_id", department_id)
        .andWhere((qb) => {
          qb.where("roll_no", roll_no).orWhere("email", email);
        })
        .first();
      //console.log("existing",existing)
      if (existing) {
        // Update existing student
        await knex("students")
          .where({ student_id: existing.student_id })
          .update({
            email,
            roll_no,
            department_id,
          });

        results.push({ ...emp, action: "updated" });
      } else {
        // Generate a random password
        const saltRounds = 10;
        const passwordHash= generatePassword(8);
        const password  = await bcrypt.hash(passwordHash, saltRounds);


        // Insert new student with password
        const [id] = await knex("students").insert({
          email,
          roll_no,
          department_id,
          password, // save generated password
        });

        results.push({ ...emp, id, password, action: "inserted" });
      }
    }

    return results;
  } catch (err) {
    logger.error(`REPOSITORY :: ADMIN :: registerBulkEmployee :: ERROR`, err);
    throw new Error("Database query failed");
  }
};



export const addstudent = async (employees) => {
  try {
    const hasTable = await knex.schema.hasTable("students");
    if (!hasTable) {
      throw new Error("Table 'students' does not exist");
    }
      const { email, roll_no, department_id } = employees;

      // Check if student exists by roll_no or email within department
      const existing = await knex("students")
        .where("department_id", department_id)
        .andWhere((qb) => {
          qb.where("roll_no", roll_no).orWhere("email", email);
        })
        .first();
      //console.log("existing",existing)
      if (existing) {
        // Update existing student
        await knex("students")
          .where({ student_id: existing.student_id })
          .update({
            email,
            roll_no,
            department_id,
          });

      } else {
        // Generate a random password
        const saltRounds = 10;
        const passwordHash= generatePassword(8);
        const password  = await bcrypt.hash(passwordHash, saltRounds);


        // Insert new student with password
        const [id] = await knex("students").insert({
          email,
          roll_no,
          department_id,
          password, // save generated password
        });
      }
    }
   catch (err) {
    logger.error(`REPOSITORY :: ADMIN :: registerBulkEmployee :: ERROR`, err);
    throw new Error("Database query failed");
  }
};



export const overallCompanyData = async () => {
  try {
    const students = await knex("companies").where("is_approved", false)
    console.log("student",students)
    return students; 
  } catch (err) {
    logger.error(`REPOSITORY :: students :: overallCompanyData :: `,err);
    throw new Error("Database query failed");
  }
};