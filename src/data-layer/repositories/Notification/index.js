import knex from "../../database-connections/campus_db/connection.js";
import logger from "../../../utils/logger.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Send notification to a single student
 */
export const sendNotificationToStudent = async (notificationData) => {
  try {
    const {
      company_id,
      student_id,
      application_status,
      message_type = "predefined",
      custom_message = null,
      created_by,
    } = notificationData;

    // Validate required fields
    if (!company_id || !student_id || !application_status || !created_by) {
      throw new Error(
        "Company ID, Student ID, Application Status, and Created By are required"
      );
    }

    // If using predefined message, get it from templates
    let predefined_message = null;
    if (message_type === "predefined") {
      const template = await knex("notification_templates")
        .where("application_status", application_status)
        .where("is_active", true)
        .first();

      if (template) {
        predefined_message = template.template_message;
      }
    }

    // Check if company and student exist
    const company = await knex("companies")
      .where("company_id", company_id)
      .first();
    const student = await knex("students")
      .where("student_id", student_id)
      .first();

    if (!company) {
      throw new Error("Company not found");
    }
    if (!student) {
      throw new Error("Student not found");
    }

    // Insert notification
    const [notification_id] = await knex("notifications").insert({
      company_id,
      student_id,
      application_status,
      message_type,
      custom_message,
      predefined_message,
      is_bulk_notification: false,
      created_by,
      sent_at: new Date(),
    });

    return {
      notification_id,
      message: "Notification sent successfully",
      student_details: {
        name: student.full_name,
        email: student.email,
        roll_no: student.roll_no,
      },
    };
  } catch (error) {
    logger.error(
      "REPOSITORY :: NOTIFICATION :: sendNotificationToStudent :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Send bulk notifications to multiple students
 */
export const sendBulkNotifications = async (bulkNotificationData) => {
  try {
    const {
      company_id,
      student_ids,
      application_status,
      message_type = "predefined",
      custom_message = null,
      created_by,
    } = bulkNotificationData;

    // Validate required fields
    if (
      !company_id ||
      !student_ids ||
      !Array.isArray(student_ids) ||
      student_ids.length === 0 ||
      !application_status ||
      !created_by
    ) {
      throw new Error(
        "Company ID, Student IDs array, Application Status, and Created By are required"
      );
    }

    // Generate bulk notification ID
    const bulk_notification_id = uuidv4();

    // Get predefined message if using predefined type
    let predefined_message = null;
    if (message_type === "predefined") {
      const template = await knex("notification_templates")
        .where("application_status", application_status)
        .where("is_active", true)
        .first();

      if (template) {
        predefined_message = template.template_message;
      }
    }

    // Verify company exists
    const company = await knex("companies")
      .where("company_id", company_id)
      .first();
    if (!company) {
      throw new Error("Company not found");
    }

    // Verify all students exist
    const existingStudents = await knex("students")
      .whereIn("student_id", student_ids)
      .select("student_id", "full_name", "email", "roll_no");

    if (existingStudents.length !== student_ids.length) {
      const foundIds = existingStudents.map((s) => s.student_id);
      const missingIds = student_ids.filter((id) => !foundIds.includes(id));
      throw new Error(`Students not found with IDs: ${missingIds.join(", ")}`);
    }

    // Prepare bulk insert data
    const notificationsToInsert = student_ids.map((student_id) => ({
      company_id,
      student_id,
      application_status,
      message_type,
      custom_message,
      predefined_message,
      is_bulk_notification: true,
      bulk_notification_id,
      created_by,
      sent_at: new Date(),
    }));

    // Insert all notifications
    await knex("notifications").insert(notificationsToInsert);

    return {
      bulk_notification_id,
      total_notifications_sent: student_ids.length,
      message: "Bulk notifications sent successfully",
      student_details: existingStudents.map((s) => ({
        student_id: s.student_id,
        name: s.full_name,
        email: s.email,
        roll_no: s.roll_no,
      })),
    };
  } catch (error) {
    logger.error(
      "REPOSITORY :: NOTIFICATION :: sendBulkNotifications :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Get notifications for a specific student
 */
export const getStudentNotifications = async (
  student_id,
  limit = 50,
  offset = 0
) => {
  try {
    const notifications = await knex("notification_details")
      .where("student_id", student_id)
      .orderBy("sent_at", "desc")
      .limit(limit)
      .offset(offset);

    const unreadCount = await knex("notifications")
      .where("student_id", student_id)
      .where("is_read", false)
      .count("notification_id as count")
      .first();

    return {
      notifications,
      unread_count: unreadCount.count || 0,
      total: notifications.length,
    };
  } catch (error) {
    logger.error(
      "REPOSITORY :: NOTIFICATION :: getStudentNotifications :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Get notifications sent by a specific company
 */
export const getCompanyNotifications = async (
  company_id,
  limit = 50,
  offset = 0
) => {
  try {
    const notifications = await knex("notification_details")
      .where("company_id", company_id)
      .orderBy("sent_at", "desc")
      .limit(limit)
      .offset(offset);

    return {
      notifications,
      total: notifications.length,
    };
  } catch (error) {
    logger.error(
      "REPOSITORY :: NOTIFICATION :: getCompanyNotifications :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notification_id, student_id) => {
  try {
    const result = await knex("notifications")
      .where("notification_id", notification_id)
      .where("student_id", student_id)
      .update({
        is_read: true,
        read_at: new Date(),
      });

    if (result === 0) {
      throw new Error("Notification not found or access denied");
    }

    return { message: "Notification marked as read" };
  } catch (error) {
    logger.error(
      "REPOSITORY :: NOTIFICATION :: markNotificationAsRead :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Mark all notifications as read for a student
 */
export const markAllNotificationsAsRead = async (student_id) => {
  try {
    const result = await knex("notifications")
      .where("student_id", student_id)
      .where("is_read", false)
      .update({
        is_read: true,
        read_at: new Date(),
      });

    return {
      message: "All notifications marked as read",
      updated_count: result,
    };
  } catch (error) {
    logger.error(
      "REPOSITORY :: NOTIFICATION :: markAllNotificationsAsRead :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Get students who applied to a company for bulk notification
 */
export const getCompanyApplicants = async (
  company_id,
  application_status = null
) => {
  try {
    let query = knex("student_companies as sc")
      .join("students as s", "sc.student_id", "s.student_id")
      .join("companies as c", "sc.company_id", "c.company_id")
      .where("sc.company_id", company_id)
      .select(
        "s.student_id",
        "s.full_name",
        "s.email",
        "s.roll_no",
        "sc.placement_status",
        "sc.applied_at"
      );

    if (application_status) {
      query = query.where("sc.placement_status", application_status);
    }

    const applicants = await query.orderBy("sc.applied_at", "desc");

    return applicants;
  } catch (error) {
    logger.error(
      "REPOSITORY :: NOTIFICATION :: getCompanyApplicants :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Get notification templates
 */
export const getNotificationTemplates = async (application_status = null) => {
  try {
    let query = knex("notification_templates").where("is_active", true);

    if (application_status) {
      query = query.where("application_status", application_status);
    }

    const templates = await query.orderBy("application_status");

    return templates;
  } catch (error) {
    logger.error(
      "REPOSITORY :: NOTIFICATION :: getNotificationTemplates :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Update notification template
 */
export const updateNotificationTemplate = async (template_id, updateData) => {
  try {
    const result = await knex("notification_templates")
      .where("template_id", template_id)
      .update({
        ...updateData,
        updated_at: new Date(),
      });

    if (result === 0) {
      throw new Error("Template not found");
    }

    return { message: "Template updated successfully" };
  } catch (error) {
    logger.error(
      "REPOSITORY :: NOTIFICATION :: updateNotificationTemplate :: ERROR",
      error
    );
    throw error;
  }
};

/**
 * Get bulk notification details
 */
export const getBulkNotificationDetails = async (bulk_notification_id) => {
  try {
    const notifications = await knex("notification_details")
      .where("bulk_notification_id", bulk_notification_id)
      .orderBy("sent_at", "desc");

    if (notifications.length === 0) {
      throw new Error("Bulk notification not found");
    }

    const summary = {
      bulk_notification_id,
      company_name: notifications[0].company_name,
      application_status: notifications[0].application_status,
      message_type: notifications[0].message_type,
      sent_at: notifications[0].sent_at,
      total_recipients: notifications.length,
      read_count: notifications.filter((n) => n.is_read).length,
      unread_count: notifications.filter((n) => !n.is_read).length,
    };

    return {
      summary,
      notifications,
    };
  } catch (error) {
    logger.error(
      "REPOSITORY :: NOTIFICATION :: getBulkNotificationDetails :: ERROR",
      error
    );
    throw error;
  }
};
