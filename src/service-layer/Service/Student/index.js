import {
  getUserForStudent,
  studentData,
  studentProfileUpdate,
  allCompanyListForStudent,
  studentApplied,
  onGoingProcess,
} from "../../../data-layer/repositories/Student/index.js";
import { getCompanyById } from "../../../data-layer/repositories/Company/index.js";
import knex from "../../../data-layer/database-connections/campus_db/connection.js";
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

export const studentAppliedService = async (student_id, company_id) => {
  try {
    // Validate input parameters
    if (!student_id || !company_id) {
      throw new Error("Student ID and Company ID are required");
    }

    // Get student data
    const student = await studentData(student_id);
    if (!student) {
      throw new Error("Student not found");
    }

    // Get company data
    const company = await getCompanyById(company_id);
    if (!company) {
      throw new Error("Company not found");
    }

    // Check if company is approved
    if (!company.is_approved || company.is_approved === "false") {
      throw new Error("Company is not approved for placement");
    }

    // Perform eligibility validations
    const validationErrors = [];

    // 1. Check minimum qualification
    if (company.min_qualification) {
      // This would need custom logic based on your qualification mapping
      // For now, we'll assume basic validation
    }

    // 2. Check 10th marks
    if (company.min_marks_10th && student.marks_10th) {
      if (parseFloat(student.marks_10th) < parseFloat(company.min_marks_10th)) {
        validationErrors.push(
          `10th marks requirement not met. Required: ${company.min_marks_10th}%, Student has: ${student.marks_10th}%`
        );
      }
    }

    // 3. Check 12th marks
    if (company.min_marks_12th && student.marks_12th) {
      if (parseFloat(student.marks_12th) < parseFloat(company.min_marks_12th)) {
        validationErrors.push(
          `12th marks requirement not met. Required: ${company.min_marks_12th}%, Student has: ${student.marks_12th}%`
        );
      }
    }

    // 4. Check UG marks
    if (company.min_marks_ug && student.marks_ug) {
      if (parseFloat(student.marks_ug) < parseFloat(company.min_marks_ug)) {
        validationErrors.push(
          `UG marks requirement not met. Required: ${company.min_marks_ug}%, Student has: ${student.marks_ug}%`
        );
      }
    }

    // 5. Check PG marks (if applicable)
    if (company.min_marks_pg && student.marks_pg) {
      if (parseFloat(student.marks_pg) < parseFloat(company.min_marks_pg)) {
        validationErrors.push(
          `PG marks requirement not met. Required: ${company.min_marks_pg}%, Student has: ${student.marks_pg}%`
        );
      }
    }

    // 6. Check backlogs
    if (
      company.max_backlogs_allowed !== null &&
      student.backlogs > company.max_backlogs_allowed
    ) {
      validationErrors.push(
        `Too many backlogs. Maximum allowed: ${company.max_backlogs_allowed}, Student has: ${student.backlogs}`
      );
    }

    // 7. Check gap years
    if (
      company.gap_years_allowed !== null &&
      student.gap_years > company.gap_years_allowed
    ) {
      validationErrors.push(
        `Too many gap years. Maximum allowed: ${company.gap_years_allowed}, Student has: ${student.gap_years}`
      );
    }

    // 8. Check if student has required profile data
    const requiredStudentFields = [
      "full_name",
      "email",
      "phone",
      "marks_10th",
      "marks_12th",
      "marks_ug",
    ];
    const missingFields = [];

    requiredStudentFields.forEach((field) => {
      if (!student[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      validationErrors.push(
        `Please complete your profile. Missing fields: ${missingFields.join(
          ", "
        )}`
      );
    }

    // 9. Check if resume is uploaded
    if (!student.resume_url) {
      validationErrors.push("Please upload your resume before applying");
    }

    // If there are validation errors, throw them
    if (validationErrors.length > 0) {
      throw new Error(
        `Eligibility criteria not met:\n${validationErrors.join("\n")}`
      );
    }

    // Check if already applied
    const existingApplication = await knex("student_companies")
      .where("student_id", student_id)
      .andWhere("company_id", company_id)
      .first();

    if (existingApplication) {
      throw new Error("You have already applied to this company");
    }

    // All validations passed, proceed with application
    const result = await studentApplied(student_id, company_id);

    // Return success response with company details
    return {
      message: "Application submitted successfully",
      company_details: {
        name: company.name,
        ctc_offered: company.ctc_offered,
        industry_type: company.industry_type,
        headquarters_location: company.headquarters_location,
        offer_type: company.offer_type,
        joining_date: company.joining_date,
      },
      application_status: "applied",
    };
  } catch (err) {
    logger.error(`SERVICE :: STUDENT :: studentAppliedService :: ERROR`, err);
    throw err; // Re-throw the original error instead of generic message
  }
};

export const onGoingProcessService = async (student_id) => {
  try {
    const result = await onGoingProcess(student_id);
    return result;
  } catch (err) {
    logger.error(`SERVICE :: STUDENT :: onGoingProcessService :: ERROR`, err);
    throw new Error("INTERNAL SERVER ERROR");
  }
};
