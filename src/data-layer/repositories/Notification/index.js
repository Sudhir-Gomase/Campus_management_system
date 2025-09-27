import knex from "../../database-connections/campus_db/connection.js";
import logger from "../../../utils/logger.js";

export const getNotificationTemplate = async (placement_status) => {
  try {
    const template = await knex("notification_templates")
      .where("placement_status", placement_status)
      .first();

    return template || null;
  } catch (err) {
    logger.error(`REPOSITORY :: NOTIFICATION :: getNotificationTemplate :: ERROR`, err);
    throw new Error("Databasequery failed");
  }
};

export const createNotification = async (message, studentId, companyId) => {
  try {
    // Verify that student and company exist
    const student = await knex("students")
      .where("student_id", studentId)
      .first();
    
    const company = await knex("companies")
      .where("company_id", companyId)
      .first();

    if (!student) {
      throw new Error("Student not found");
    }

    if (!company) {
      throw new Error("Company not found");
    }

    // Insert notification
    const [notification_id] = await knex("notifications").insert({
      company_id: companyId,
      student_id: studentId,
      message_body: message,
      updated_at: new Date(),
    });

    return {
      notification_id,
      company_id: companyId,
      student_id: studentId,
      message_body: message,
      student_name: student.full_name,
      company_name: company.name,
      created_at: new Date(),
    };
  } catch (err) {
    logger.error(`REPOSITORY :: NOTIFICATION :: createNotification :: ERROR`, err);
    throw new Error("Database query failed");
  }
};

export const getNotification = async (studentId, companyId = null, orderBy = 'updated_at', order = 'desc') => {
  try {
    // Build query with student and company details
    let query = knex("notifications as n")
      .join("students as s", "n.student_id", "s.student_id")
      .join("companies as c", "n.company_id", "c.company_id")
      .where("n.student_id", studentId)
      .select(
        "n.notification_id",
        "n.company_id",
        "n.student_id", 
        "n.message_body",
        "n.updated_at",
        "s.full_name as student_name",
        "s.email as student_email",
        "c.name as company_name"
      );

    // Add company filter if companyId is provided
    if (companyId !== null) {
      query = query.andWhere("n.company_id", companyId);
    }

    // Apply ordering
    const notifications = await query.orderBy(`n.${orderBy}`, order);

    return {
      notifications,
      total_count: notifications.length,
      student_id: studentId,
      company_id: companyId,
      order_by: orderBy,
      order: order,
      filter_type: companyId ? "company_specific" : "all_companies"
    };
  } catch (err) {
    logger.error(`REPOSITORY :: NOTIFICATION :: getNotification :: ERROR`, err);
    throw new Error("Database query failed");
  }
};