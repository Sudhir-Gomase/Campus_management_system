import {
  companyRegistrationService,
  companyLoginService,
  updateCompanyProfileService,
  getCompanyProfileService,
  getCompanyApplicationsService,
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
    return reply.status(200).send({
      success: true,
      message: result,
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

    if (!companyId) {
      return reply.status(400).send({
        success: false,
        error: "Company ID is required in URL parameters",
      });
    }

    const result = await getCompanyApplicationsService(companyId);

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Company applications retrieved successfully"
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: COMPANY :: getCompanyApplicationsController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};
