import {
  sendSingleNotificationController,
  sendBulkNotificationController,
  getStudentNotificationsController,
  getCompanyNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  getCompanyApplicantsController,
  getNotificationTemplatesController,
  updateNotificationTemplateController,
  getBulkNotificationDetailsController,
  sendStatusUpdateNotificationController,
  getNotificationStatsController,
} from "../../service-layer/Controllers/Notification/index.js";

export default async function routes(fastify, options) {
  // ==== COMPANY ROUTES (for sending notifications) ====

  // Send notification to single student
  fastify.post("/notifications/send-single", {
    handler: sendSingleNotificationController,
  });

  // Send bulk notifications to multiple students
  fastify.post("/notifications/send-bulk", {
    handler: sendBulkNotificationController,
  });

  // Get applicants for a company (for bulk notification selection)
  fastify.get("/notifications/company/:company_id/applicants", {
    handler: getCompanyApplicantsController,
  });

  // Get notifications sent by a company
  fastify.get("/notifications/company/:company_id", {
    handler: getCompanyNotificationsController,
  });

  // Get notification statistics for a company
  fastify.get("/notifications/company/:company_id/stats", {
    handler: getNotificationStatsController,
  });

  // Send notification when updating application status
  fastify.post("/notifications/status-update", {
    handler: sendStatusUpdateNotificationController,
  });

  // Get bulk notification details
  fastify.get("/notifications/bulk/:bulk_notification_id", {
    handler: getBulkNotificationDetailsController,
  });

  // ==== STUDENT ROUTES (for receiving/reading notifications) ====

  // Get notifications for a student
  fastify.get("/notifications/student/:student_id", {
    handler: getStudentNotificationsController,
  });

  // Mark single notification as read
  fastify.put("/notifications/:notification_id/read", {
    handler: markNotificationReadController,
  });

  // Mark all notifications as read for a student
  fastify.put("/notifications/student/:student_id/read-all", {
    handler: markAllNotificationsReadController,
  });

  // ==== TEMPLATE MANAGEMENT ROUTES ====

  // Get notification templates
  fastify.get("/notifications/templates", {
    handler: getNotificationTemplatesController,
  });

  // Update notification template
  fastify.put("/notifications/templates/:template_id", {
    handler: updateNotificationTemplateController,
  });
}
