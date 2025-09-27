import logger from "../../../utils/logger.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import knex from "../../../data-layer/database-connections/campus_db/connection.js";
import {
  companyRegistration,
  companyLogin,
  updateCompanyData,
  getCompanyById,
  getCompanyApplications,
  updateApplicationStatus,
  changeCompanyPassword,
} from "../../../../src/data-layer/repositories/Company/index.js";

export const companyRegistrationService = async (data) => {
  try {
    // Format joining_date to MySQL DATE format if provided
    if (data.joining_date) {
      const joiningDate = new Date(data.joining_date);
      if (isNaN(joiningDate.getTime())) {
        throw new Error("Invalid joining date format");
      }
      // Convert to YYYY-MM-DD format for MySQL DATE column
      data.joining_date = joiningDate.toISOString().split("T")[0];
    }

    // Perform the registration logic here
    const result = companyRegistration(data); // Assume companyRegistration is a function that handles the logic
    return result;
  } catch (error) {
    logger.error(
      "SERVICE :: COMPANY :: companyRegistrationService :: ERROR",
      error
    );
    throw error;
  }
};

export const companyLoginService = async (data) => {
  try {
    // First verify login credentials
    const loginResult = await companyLogin(data);

    if (loginResult === "Company login successful") {
      // Get company details for JWT
      const company = await knex("companies")
        .where("username", data.username)
        .first();

      if (!company) {
        throw new Error("Company not found");
      }

      // Generate JWT
      const userPayload = {
        companyId: company.company_id,
        username: company.username,
        email: company.contact_email,
        role: "company",
      };

      const secretBuffer = Buffer.from(
        process.env.JWT_SECRET_KEY || "secret-key"
      );

      const token = jwt.sign(userPayload, secretBuffer, { expiresIn: "24h" });

      return {
        companyId: company.company_id,
        username: company.username,
        name: company.name,
        email: company.contact_email,
        role: "company",
        token,
        expireIN: "24h",
      };
    }

    return loginResult;
  } catch (error) {
    logger.error("SERVICE :: COMPANY :: companyLoginService :: ERROR", error);
    throw error;
  }
};

export const updateCompanyProfileService = async (companyId, updateData) => {
  try {
    // Business logic validation
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    // Validate that company exists
    await getCompanyById(companyId);

    // Define allowed fields for update (excluding is_approved)
    const allowedFields = [
      "name",
      "description",
      "contact_email",
      "contact_phone",
      "ctc_offered",
      "website_url",
      "industry_type",
      "company_size",
      "headquarters_location",
      "establishment_year",
      "min_qualification",
      "min_marks_10th",
      "min_marks_12th",
      "min_marks_ug",
      "min_marks_pg",
      "max_backlogs_allowed",
      "gap_years_allowed",
      "offer_type",
      "joining_date",
      "bond_details",
      "selection_rounds",
      "benefits",
      "preferred_skills",
      "preferred_locations",
      "interview_process",
      "mode_of_interview",
      "platforms",
    ];

    // Filter only allowed fields
    const filteredData = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    // Additional business validations
    if (filteredData.ctc_offered && filteredData.ctc_offered < 0) {
      throw new Error("CTC offered cannot be negative");
    }

    if (
      filteredData.contact_email &&
      !isValidEmail(filteredData.contact_email)
    ) {
      throw new Error("Invalid email format");
    }

    // Format joining_date to MySQL DATE format (YYYY-MM-DD)
    if (filteredData.joining_date) {
      const joiningDate = new Date(filteredData.joining_date);
      if (isNaN(joiningDate.getTime())) {
        throw new Error("Invalid joining date format");
      }
      // Convert to YYYY-MM-DD format for MySQL DATE column
      filteredData.joining_date = joiningDate.toISOString().split("T")[0];
    }

    const result = await updateCompanyData(companyId, filteredData);
    return {
      message: "Company profile updated successfully",
      data: result,
    };
  } catch (error) {
    logger.error(
      "SERVICE :: COMPANY :: updateCompanyProfileService :: ERROR",
      error
    );
    throw error;
  }
};

export const getCompanyProfileService = async (companyId) => {
  try {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    const company = await getCompanyById(companyId);

    // Remove sensitive information before returning
    const { password, ...companyProfile } = company;

    return companyProfile;
  } catch (error) {
    logger.error(
      "SERVICE :: COMPANY :: getCompanyProfileService :: ERROR",
      error
    );
    throw error;
  }
};

export const getCompanyApplicationsService = async (companyId, status) => {
  try {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    // Validate that company exists
    await getCompanyById(companyId);

    // Accept status param
    const result = await getCompanyApplications(companyId, status);

    return {
      message: "Company applications retrieved successfully",
      data: result,
    };
  } catch (error) {
    logger.error(
      "SERVICE :: COMPANY :: getCompanyApplicationsService :: ERROR",
      error
    );
    throw error;
  }
};

export const updateApplicationStatusService = async (
  companyId,
  studentId,
  status
) => {
  try {
    const validStatuses = [
      "applied",
      "shortlisted",
      "interviewed",
      "selected",
      "rejected",
    ];

    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status provided");
    }

    const result = await updateApplicationStatus(companyId, studentId, status);
    return result;
  } catch (error) {
    logger.error(
      "SERVICE :: COMPANY :: updateApplicationStatusService :: ERROR",
      error
    );
    throw error;
  }
};

// Helper function for email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const companyChangePasswordService = async (companyId, currentPassword, newPassword) => {
  try {
    // Get company by ID
    const company = await knex("companies").where("company_id", companyId).first();
    
    if (!company) {
      return "Company not found";
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, company.password);
    if (!isCurrentPasswordValid) {
      return "Invalid current password";
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const result = await changeCompanyPassword(companyId, hashedNewPassword);
    
    if (result) {
      return "Password changed successfully";
    } else {
      throw new Error("Failed to update password");
    }
  } catch (error) {
    logger.error(`SERVICE :: COMPANY :: companyChangePasswordService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
};
