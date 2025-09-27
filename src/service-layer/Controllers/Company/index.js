import {
  companyRegistrationService,
  companyLoginService,
  updateCompanyProfileService,
  getCompanyProfileService,
  getCompanyApplicationsService,
  updateApplicationStatusService,
  companyChangePasswordService,
} from "../../Service/Company/index.js";
import { getStatusCode } from "../../../utils/getStatusCode.js";
import logger from "../../../utils/logger.js";

export const companyRegistrationController = async (req, reply) => {
  try {
    const data = req.body;
    const result = await companyRegistrationService(data);
    return reply.status(201).send({
      success: true,
      message: result,
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: COMPANY :: companyRegistrationController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

export const companyLoginController = async (req, reply) => {
  try {
    const data = req.body;
    const result = await companyLoginService(data);

    // Check if login failed
    if (typeof result === "string") {
      return reply.status(400).send({
        success: false,
        error: result,
      });
    }

    // Successful login with JWT
    const { companyId, token, expireIN, username, name, email } = result;

    if (!token) {
      return reply.status(500).send({
        success: false,
        error: "Token generation failed",
      });
    }

    return reply.status(200).send({
      success: true,
      data: {
        token,
        companyId,
        expireIn: expireIN,
        username,
        name,
        email,
        role: "company",
      },
      message: "Login successful",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: COMPANY :: companyLoginController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

export const updateCompanyProfileController = async (req, reply) => {
  try {
    const companyId = req.params.companyId;
    const updateData = req.body;

    if (!companyId) {
      return reply.status(400).send({
        success: false,
        error: "Company ID is required in URL parameters",
      });
    }

    const result = await updateCompanyProfileService(companyId, updateData);

    return reply.status(200).send({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: COMPANY :: updateCompanyProfileController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

export const getCompanyProfileController = async (req, reply) => {
  try {
    const companyId = req.params.companyId;

    if (!companyId) {
      return reply.status(400).send({
        success: false,
        error: "Company ID is required in URL parameters",
      });
    }

    const result = await getCompanyProfileService(companyId);

    return reply.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: COMPANY :: getCompanyProfileController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

export const getCompanyApplicationsController = async (req, reply) => {
  try {
    const companyId = req.params.companyId;
    const status = req.query.status;

    if (!companyId) {
      return reply.status(400).send({
        success: false,
        error: "Company ID is required in URL parameters",
      });
    }

    const result = await getCompanyApplicationsService(companyId, status);

    return reply.status(200).send({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: COMPANY :: getCompanyApplicationsController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

export const updateApplicationStatusController = async (req, reply) => {
  try {
    const { companyId, studentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return reply.status(400).send({
        success: false,
        error: "Status is required",
      });
    }

    const result = await updateApplicationStatusService(
      companyId,
      studentId,
      status
    );

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Application status updated successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: COMPANY :: updateApplicationStatusController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

export const companyChangePasswordController = async (req, reply) => {
  try {
    const { companyId, currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!companyId || !currentPassword || !newPassword) {
      return reply.status(400).send({
        success: false,
        error: "Company ID, current password, and new password are required",
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return reply.status(400).send({
        success: false,
        error: "New password must be at least 8 characters long",
      });
    }

    const result = await companyChangePasswordService(companyId, currentPassword, newPassword);

    if (result === "Invalid current password") {
      return reply.status(400).send({
        success: false,
        error: "Current password is incorrect",
      });
    }

    if (result === "Company not found") {
      return reply.status(404).send({
        success: false,
        error: "Company not found",
      });
    }

    return reply.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error("ERROR :: COMPANY :: companyChangePasswordController", error);
    await getStatusCode(error, reply);
  }
};
