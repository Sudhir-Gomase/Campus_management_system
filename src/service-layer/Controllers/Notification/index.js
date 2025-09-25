import {
  sendSingleNotificationService,
  sendBulkNotificationService,
  getStudentNotificationsService,
  getCompanyNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
  getCompanyApplicantsService,
  getNotificationTemplatesService,
  updateNotificationTemplateService,
  getBulkNotificationDetailsService,
  sendStatusUpdateNotificationService,
} from "../../Service/Notification/index.js";
import { getStatusCode } from "../../../utils/getStatusCode.js";
import logger from "../../../utils/logger.js";

/**
 * Controller to send notification to a single student
 */
export const sendSingleNotificationController = async (request, reply) => {
  try {
    const notificationData = request.body;

    // Add created_by from JWT token (assuming company is authenticated)
    notificationData.created_by =
      request.user?.id || request.user?.companyId || 1; // fallback for testing

    const result = await sendSingleNotificationService(notificationData);

    return reply.status(201).send({
      success: true,
      data: result,
      message: "Notification sent successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: sendSingleNotificationController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to send bulk notifications
 */
export const sendBulkNotificationController = async (request, reply) => {
  try {
    const bulkNotificationData = request.body;

    // Add created_by from JWT token
    bulkNotificationData.created_by =
      request.user?.id || request.user?.companyId || 1; // fallback for testing

    const result = await sendBulkNotificationService(bulkNotificationData);

    return reply.status(201).send({
      success: true,
      data: result,
      message: "Bulk notifications sent successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: sendBulkNotificationController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to get notifications for a student
 */
export const getStudentNotificationsController = async (request, reply) => {
  try {
    const { student_id } = request.params;
    const { page = 1, limit = 20 } = request.query;

    if (!student_id) {
      return reply.status(400).send({
        success: false,
        error: "Student ID is required in URL parameters",
      });
    }

    const result = await getStudentNotificationsService(
      parseInt(student_id),
      parseInt(page),
      parseInt(limit)
    );

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Student notifications retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: getStudentNotificationsController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to get notifications sent by a company
 */
export const getCompanyNotificationsController = async (request, reply) => {
  try {
    const { company_id } = request.params;
    const { page = 1, limit = 20 } = request.query;

    if (!company_id) {
      return reply.status(400).send({
        success: false,
        error: "Company ID is required in URL parameters",
      });
    }

    const result = await getCompanyNotificationsService(
      parseInt(company_id),
      parseInt(page),
      parseInt(limit)
    );

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Company notifications retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: getCompanyNotificationsController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to mark notification as read
 */
export const markNotificationReadController = async (request, reply) => {
  try {
    const { notification_id } = request.params;
    const { student_id } = request.body;

    if (!notification_id) {
      return reply.status(400).send({
        success: false,
        error: "Notification ID is required in URL parameters",
      });
    }

    const result = await markNotificationReadService(
      parseInt(notification_id),
      parseInt(student_id)
    );

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Notification marked as read",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: markNotificationReadController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to mark all notifications as read for a student
 */
export const markAllNotificationsReadController = async (request, reply) => {
  try {
    const { student_id } = request.params;

    if (!student_id) {
      return reply.status(400).send({
        success: false,
        error: "Student ID is required in URL parameters",
      });
    }

    const result = await markAllNotificationsReadService(parseInt(student_id));

    return reply.status(200).send({
      success: true,
      data: result,
      message: "All notifications marked as read",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: markAllNotificationsReadController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to get company applicants for bulk notification
 */
export const getCompanyApplicantsController = async (request, reply) => {
  try {
    const { company_id } = request.params;
    const { status } = request.query;

    if (!company_id) {
      return reply.status(400).send({
        success: false,
        error: "Company ID is required in URL parameters",
      });
    }

    const result = await getCompanyApplicantsService(
      parseInt(company_id),
      status
    );

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Company applicants retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: getCompanyApplicantsController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to get notification templates
 */
export const getNotificationTemplatesController = async (request, reply) => {
  try {
    const { status } = request.query;

    const result = await getNotificationTemplatesService(status);

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Notification templates retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: getNotificationTemplatesController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to update notification template
 */
export const updateNotificationTemplateController = async (request, reply) => {
  try {
    const { template_id } = request.params;
    const updateData = request.body;

    if (!template_id) {
      return reply.status(400).send({
        success: false,
        error: "Template ID is required in URL parameters",
      });
    }

    const result = await updateNotificationTemplateService(
      parseInt(template_id),
      updateData
    );

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Template updated successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: updateNotificationTemplateController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to get bulk notification details
 */
export const getBulkNotificationDetailsController = async (request, reply) => {
  try {
    const { bulk_notification_id } = request.params;

    if (!bulk_notification_id) {
      return reply.status(400).send({
        success: false,
        error: "Bulk notification ID is required in URL parameters",
      });
    }

    const result = await getBulkNotificationDetailsService(
      bulk_notification_id
    );

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Bulk notification details retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: getBulkNotificationDetailsController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to send notification when application status is updated
 */
export const sendStatusUpdateNotificationController = async (
  request,
  reply
) => {
  try {
    const { student_id, company_id, new_status, custom_message } = request.body;

    // Add created_by from JWT token
    const created_by = request.user?.id || request.user?.companyId || 1; // fallback for testing

    const result = await sendStatusUpdateNotificationService(
      student_id,
      company_id,
      new_status,
      custom_message,
      created_by
    );

    return reply.status(201).send({
      success: true,
      data: result,
      message: "Status update notification sent successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: sendStatusUpdateNotificationController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};

/**
 * Controller to get notification statistics for a company
 */
export const getNotificationStatsController = async (request, reply) => {
  try {
    const { company_id } = request.params;

    if (!company_id) {
      return reply.status(400).send({
        success: false,
        error: "Company ID is required in URL parameters",
      });
    }

    // This could be expanded to include more detailed statistics
    const result = await getCompanyNotificationsService(
      parseInt(company_id),
      1,
      1000
    );

    // Calculate statistics
    const stats = {
      total_notifications: result.notifications.length,
      by_status: {},
      by_type: { custom: 0, predefined: 0 },
      read_rate: 0,
      recent_notifications: result.notifications.slice(0, 5),
    };

    result.notifications.forEach((notification) => {
      // Count by status
      const status = notification.application_status;
      stats.by_status[status] = (stats.by_status[status] || 0) + 1;

      // Count by type
      stats.by_type[notification.message_type]++;
    });

    // Calculate read rate
    const readNotifications = result.notifications.filter(
      (n) => n.is_read
    ).length;
    stats.read_rate =
      result.notifications.length > 0
        ? Math.round((readNotifications / result.notifications.length) * 100)
        : 0;

    return reply.status(200).send({
      success: true,
      data: stats,
      message: "Notification statistics retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "CONTROLLER :: NOTIFICATION :: getNotificationStatsController :: ERROR",
      error
    );
    await getStatusCode(error, reply);
  }
};
