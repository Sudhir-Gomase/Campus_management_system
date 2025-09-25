import {
  sendNotificationToStudent,
  sendBulkNotifications,
  getStudentNotifications,
  getCompanyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getCompanyApplicants,
  getNotificationTemplates,
  updateNotificationTemplate,
  getBulkNotificationDetails,
} from "../../../data-layer/repositories/Notification/index.js";
import logger from "../../../utils/logger.js";

/**
 * Service to send notification to a single student
 */
export const sendSingleNotificationService = async (notificationData) => {
  try {
    // Business logic validation
    const {
      company_id,
      student_id,
      application_status,
      message_type,
      custom_message,
      created_by,
    } = notificationData;

    // Validate application status
    const validStatuses = [
      "applied",
      "shortlisted",
      "interviewed",
      "selected",
      "rejected",
    ];
    if (!validStatuses.includes(application_status)) {
      throw new Error(
        `Invalid application status. Must be one of: ${validStatuses.join(
          ", "
        )}`
      );
    }

    // Validate message type and content
    if (
      message_type === "custom" &&
      (!custom_message || custom_message.trim().length === 0)
    ) {
      throw new Error(
        "Custom message is required when message type is 'custom'"
      );
    }

    if (message_type === "custom" && custom_message.length > 1000) {
      throw new Error("Custom message cannot exceed 1000 characters");
    }

    // Call repository function
    const result = await sendNotificationToStudent(notificationData);

    return result;
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: sendSingleNotificationService :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Service to send bulk notifications to multiple students
 */
export const sendBulkNotificationService = async (bulkNotificationData) => {
  try {
    const {
      company_id,
      student_ids,
      application_status,
      message_type,
      custom_message,
      created_by,
    } = bulkNotificationData;

    // Business logic validation
    const validStatuses = [
      "applied",
      "shortlisted",
      "interviewed",
      "selected",
      "rejected",
    ];
    if (!validStatuses.includes(application_status)) {
      throw new Error(
        `Invalid application status. Must be one of: ${validStatuses.join(
          ", "
        )}`
      );
    }

    // Validate student IDs array
    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      throw new Error("Student IDs must be a non-empty array");
    }

    if (student_ids.length > 100) {
      throw new Error(
        "Cannot send bulk notifications to more than 100 students at once"
      );
    }

    // Validate message for custom type
    if (
      message_type === "custom" &&
      (!custom_message || custom_message.trim().length === 0)
    ) {
      throw new Error(
        "Custom message is required when message type is 'custom'"
      );
    }

    if (message_type === "custom" && custom_message.length > 1000) {
      throw new Error("Custom message cannot exceed 1000 characters");
    }

    // Call repository function
    const result = await sendBulkNotifications(bulkNotificationData);

    return result;
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: sendBulkNotificationService :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Service to get notifications for a student
 */
export const getStudentNotificationsService = async (
  student_id,
  page = 1,
  limit = 20
) => {
  try {
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 20;

    const offset = (page - 1) * limit;

    const result = await getStudentNotifications(student_id, limit, offset);

    return {
      ...result,
      pagination: {
        current_page: page,
        per_page: limit,
        has_more: result.notifications.length === limit,
      },
    };
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: getStudentNotificationsService :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Service to get notifications sent by a company
 */
export const getCompanyNotificationsService = async (
  company_id,
  page = 1,
  limit = 20
) => {
  try {
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 20;

    const offset = (page - 1) * limit;

    const result = await getCompanyNotifications(company_id, limit, offset);

    return {
      ...result,
      pagination: {
        current_page: page,
        per_page: limit,
        has_more: result.notifications.length === limit,
      },
    };
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: getCompanyNotificationsService :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Service to mark notification as read
 */
export const markNotificationReadService = async (
  notification_id,
  student_id
) => {
  try {
    if (!notification_id || !student_id) {
      throw new Error("Notification ID and Student ID are required");
    }

    const result = await markNotificationAsRead(notification_id, student_id);
    return result;
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: markNotificationReadService :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Service to mark all notifications as read for a student
 */
export const markAllNotificationsReadService = async (student_id) => {
  try {
    if (!student_id) {
      throw new Error("Student ID is required");
    }

    const result = await markAllNotificationsAsRead(student_id);
    return result;
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: markAllNotificationsReadService :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Service to get company applicants for bulk notification
 */
export const getCompanyApplicantsService = async (
  company_id,
  application_status = null
) => {
  try {
    if (!company_id) {
      throw new Error("Company ID is required");
    }

    // Validate application status if provided
    if (application_status) {
      const validStatuses = [
        "applied",
        "shortlisted",
        "interviewed",
        "selected",
        "rejected",
      ];
      if (!validStatuses.includes(application_status)) {
        throw new Error(
          `Invalid application status filter. Must be one of: ${validStatuses.join(
            ", "
          )}`
        );
      }
    }

    const applicants = await getCompanyApplicants(
      company_id,
      application_status
    );

    return {
      company_id,
      filter_status: application_status || "all",
      total_applicants: applicants.length,
      applicants,
    };
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: getCompanyApplicantsService :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Service to get notification templates
 */
export const getNotificationTemplatesService = async (
  application_status = null
) => {
  try {
    // Validate application status if provided
    if (application_status) {
      const validStatuses = [
        "applied",
        "shortlisted",
        "interviewed",
        "selected",
        "rejected",
      ];
      if (!validStatuses.includes(application_status)) {
        throw new Error(
          `Invalid application status. Must be one of: ${validStatuses.join(
            ", "
          )}`
        );
      }
    }

    const templates = await getNotificationTemplates(application_status);

    return {
      filter_status: application_status || "all",
      total_templates: templates.length,
      templates,
    };
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: getNotificationTemplatesService :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Service to update notification template
 */
export const updateNotificationTemplateService = async (
  template_id,
  updateData
) => {
  try {
    if (!template_id) {
      throw new Error("Template ID is required");
    }

    // Validate update data
    const allowedFields = ["template_title", "template_message", "is_active"];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    // Validate message length
    if (
      filteredData.template_message &&
      filteredData.template_message.length > 1000
    ) {
      throw new Error("Template message cannot exceed 1000 characters");
    }

    const result = await updateNotificationTemplate(template_id, filteredData);
    return result;
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: updateNotificationTemplateService :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Service to get bulk notification details
 */
export const getBulkNotificationDetailsService = async (
  bulk_notification_id
) => {
  try {
    if (!bulk_notification_id) {
      throw new Error("Bulk notification ID is required");
    }

    const result = await getBulkNotificationDetails(bulk_notification_id);
    return result;
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: getBulkNotificationDetailsService :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Service to send notifications based on application status update
 * This can be used when companies update student application status
 */
export const sendStatusUpdateNotificationService = async (
  student_id,
  company_id,
  new_status,
  custom_message = null,
  created_by
) => {
  try {
    // Validate the new status
    const validStatuses = [
      "applied",
      "shortlisted",
      "interviewed",
      "selected",
      "rejected",
    ];
    if (!validStatuses.includes(new_status)) {
      throw new Error(
        `Invalid application status. Must be one of: ${validStatuses.join(
          ", "
        )}`
      );
    }

    // Prepare notification data
    const notificationData = {
      company_id,
      student_id,
      application_status: new_status,
      message_type: custom_message ? "custom" : "predefined",
      custom_message,
      created_by,
    };

    // Send the notification
    const result = await sendNotificationToStudent(notificationData);

    return {
      ...result,
      status_updated_to: new_status,
    };
  } catch (error) {
    logger.error(
      "SERVICE :: NOTIFICATION :: sendStatusUpdateNotificationService :: ERROR",
      error
    );
    throw error;
  }
};
