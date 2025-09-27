import {
  getNotificationTemplate,
  createNotification,
  getNotification,
} from "../../../data-layer/repositories/Notification/index.js";
import logger from "../../../utils/logger.js";

export const getNotificationTemplateService = async (placement_status) => {
  try {
    // Validate placement status
    const validStatuses = [
      "applied",
      "shortlisted", 
      "interviewed",
      "selected",
      "rejected"
    ];

    if (!validStatuses.includes(placement_status)) {
      throw new Error(`Invalid placement status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const result = await getNotificationTemplate(placement_status);
    return result;
  } catch (error) {
    logger.error(`SERVICE :: NOTIFICATION :: getNotificationTemplateService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
};

export const createNotificationService = async (message, studentId, companyId) => {
  try {
    // Validate message length
    if (message.length > 1000) {
      throw new Error("Message cannot exceed 1000 characters");
    }

    // Validate IDs are positive numbers
    if (studentId <= 0 || companyId <= 0) {
      throw new Error("studentId and companyId must be positive numbers");
    }

    const result = await createNotification(message, studentId, companyId);
    return result;
  } catch (error) {
    logger.error(`SERVICE :: NOTIFICATION :: createNotificationService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
};

export const getNotificationService = async (studentId, companyId = null, orderBy = 'updated_at', order = 'desc') => {
  try {
    // Validate studentId is positive number
    if (studentId <= 0) {
      throw new Error("studentId must be a positive number");
    }

    // Validate companyId if provided
    if (companyId !== null && companyId <= 0) {
      throw new Error("companyId must be a positive number");
    }

    const result = await getNotification(studentId, companyId, orderBy, order);
    return result;
  } catch (error) {
    logger.error(`SERVICE :: NOTIFICATION :: getNotificationService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
};