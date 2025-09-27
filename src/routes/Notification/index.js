import {
  getNotificationTemplateController,
  createNotificationController,
  getNotificationController,
} from "../../service-layer/Controllers/Notification/index.js";

export default async function routes(fastify, options) {
  // Get notification template by placement status
  fastify.get("/notification-template", {
    handler: getNotificationTemplateController,
  });

  // Create notification
  fastify.post("/createnotification", {
    handler: createNotificationController,
  });

  // Get notifications by studentId (companyId optional in query params)
  fastify.get("/getnotification/:studentId", {
    handler: getNotificationController,
  });
}