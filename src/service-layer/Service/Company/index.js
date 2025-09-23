import logger from "../../../utils/logger.js";
import {
  companyRegistration,
  companyLogin,
  updateCompanyData,
  getCompanyById,
  getCompanyApplications,
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
    const result = companyLogin(data); // Assume companyLogin is a function that handles the logic
    return result;
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

export const getCompanyApplicationsService = async (companyId) => {
  try {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    // Validate that company exists
    await getCompanyById(companyId);

    // Get all applications for this company
    const applications = await getCompanyApplications(companyId);

    // Group applications by status for better organization
    const applicationStats = {
      total: applications.length,
      applied: applications.filter(app => app.placement_status === 'applied').length,
      shortlisted: applications.filter(app => app.placement_status === 'shortlisted').length,
      interviewed: applications.filter(app => app.placement_status === 'interviewed').length,
      selected: applications.filter(app => app.placement_status === 'selected').length,
      rejected: applications.filter(app => app.placement_status === 'rejected').length,
    };

    return {
      applications,
      statistics: applicationStats
    };
  } catch (error) {
    logger.error(
      "SERVICE :: COMPANY :: getCompanyApplicationsService :: ERROR",
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
