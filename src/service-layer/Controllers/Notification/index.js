import {
  getNotificationTemplateService,
  createNotificationService,
  getNotificationService,
} from "../../Service/Notification/index.js";
import { getStatusCode } from "../../../utils/getStatusCode.js";
import logger from "../../../utils/logger.js";

export const getNotificationTemplateController = async (request, reply) => {
  try {
    const { placement_status } = request.query;

    if (!placement_status) {
      return reply.status(400).send({
        success: false,
        error: "placement_status query parameter is required",
      });
    }

    const result = await getNotificationTemplateService(placement_status);

    if (!result) {
      return reply.status(404).send({
        success: false,
        error: "No template found for the given placement status",
      });
    }

    return reply.status(200).send({
      success: true,
      data: result,
      message: "Notification template retrieved successfully",
    });
  } catch (error) {
    logger.error("ERROR :: NOTIFICATION :: getNotificationTemplateController", error);
    await getStatusCode(error, reply);
  }
};

export const createNotificationController = async (request, reply) => {
  try {
    const { message, studentId, companyId } = request.body;

    // Validate required fields
    if (!message || !studentId || !companyId) {
      return reply.status(400).send({
        success: false,
        error: "message, studentId, and/ companyId are required",
      });
    }

    // Validate data types
    if (typeof studentId !== 'number' || typeof companyId !== 'number') {
      return reply.status(400).send({
        success: false,
        error: "studentId and companyId must be numbers",
      });
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return reply.status(400).send({
        success: false,
        error: "message must be a non-empty string",
      });
    }

    const result = await createNotificationService(message, studentId, companyId);

    return reply.status(201).send({
      success: true,
      data: result,
      message: "Notification created successfully",
    });
  } catch (error) {
    logger.error("ERROR :: NOTIFICATION :: createNotificationController", error);
    await getStatusCode(error, reply);
  }
};

export const getNotificationController = async (request, reply) => {
  try {
    const { studentId } = request.params;
    const { companyId, orderBy = 'updated_at', order = 'desc' } = request.query;

    // Validate required studentId parameter
    if (!studentId) {
      return reply.status(400).send({
        success: false,
        error: "studentId is required in URL parameters",
      });
    }

    // Validate and convert studentId to number
    const studentIdNum = parseInt(studentId);
    if (isNaN(studentIdNum)) {
      return reply.status(400).send({
        success: false,
        error: "studentId must be a valid number",
      });
    }

    // Validate and convert companyId to number (if provided)
    let companyIdNum = null;
    if (companyId) {
      companyIdNum = parseInt(companyId);
      if (isNaN(companyIdNum)) {
        return reply.status(400).send({
          success: false,
          error: "companyId must be a valid number",
        });
      }
    }

    // Validate orderBy parameter
    const validOrderBy = ['notification_id', 'company_id', 'student_id', 'message_body', 'updated_at'];
    if (!validOrderBy.includes(orderBy)) {
      return reply.status(400).send({
        success: false,
        error: `Invalid orderBy parameter. Must be one of: ${validOrderBy.join(', ')}`,
      });
    }

    // Validate order parameter
    const validOrder = ['asc', 'desc'];
    if (!validOrder.includes(order.toLowerCase())) {
      return reply.status(400).send({
        success: false,
        error: "Invalid order parameter. Must be 'asc' or 'desc'",
      });
    }

    const result = await getNotificationService(studentIdNum, companyIdNum, orderBy, order.toLowerCase());

    return reply.status(200).send({
      success: true,
      data: result,
      message: companyIdNum ? "Notifications retrieved successfully" : "All notifications for student retrieved successfully",
    });
  } catch (error) {
    logger.error("ERROR :: NOTIFICATION :: getNotificationController", error);
    await getStatusCode(error, reply);
  }
};
