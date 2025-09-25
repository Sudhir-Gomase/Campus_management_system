-- Create notifications table for campus placement system
-- This table handles notifications from companies to students about application status

CREATE TABLE notifications (
  notification_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  application_status ENUM('applied', 'shortlisted', 'interviewed', 'selected', 'rejected') NOT NULL,
  message_type ENUM('custom', 'predefined') DEFAULT 'predefined',
  custom_message TEXT NULL,
  predefined_message TEXT NULL,
  is_bulk_notification BOOLEAN DEFAULT FALSE,
  bulk_notification_id VARCHAR(36) NULL COMMENT 'UUID for grouping bulk notifications',
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  created_by INT UNSIGNED NOT NULL COMMENT 'Company admin/user who created the notification',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  
  -- Indexes for better performance
  INDEX idx_company_student (company_id, student_id),
  INDEX idx_student_unread (student_id, is_read),
  INDEX idx_bulk_notification (bulk_notification_id),
  INDEX idx_sent_at (sent_at),
  INDEX idx_application_status (application_status)
);

-- Create a table for predefined message templates
CREATE TABLE notification_templates (
  template_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_status ENUM('applied', 'shortlisted', 'interviewed', 'selected', 'rejected') NOT NULL,
  template_title VARCHAR(255) NOT NULL,
  template_message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Ensure unique templates per status
  UNIQUE KEY unique_status_template (application_status, template_title)
);

-- Insert default predefined templates
INSERT INTO notification_templates (application_status, template_title, template_message) VALUES 
('applied', 'Application Received', 'Thank you for applying to our company. We have received your application and will review it soon. We will update you on the next steps.'),
('shortlisted', 'Application Shortlisted', 'Congratulations! Your application has been shortlisted for the next round. Please wait for further instructions regarding the interview process.'),
('interviewed', 'Interview Completed', 'Thank you for attending the interview. We will get back to you with the results soon. Please wait for further communication.'),
('selected', 'Application Selected', 'Congratulations! You have been selected for the position. HR will contact you soon with offer details and next steps.'),
('rejected', 'Application Not Selected', 'Thank you for your interest in our company. Unfortunately, we have decided to move forward with other candidates. We wish you all the best in your job search.');

-- Create a view for easy notification retrieval with company and student details
CREATE VIEW notification_details AS
SELECT 
  n.notification_id,
  n.company_id,
  c.name AS company_name,
  n.student_id,
  s.full_name AS student_name,
  s.email AS student_email,
  s.roll_no AS student_roll_no,
  n.application_status,
  n.message_type,
  CASE 
    WHEN n.message_type = 'custom' THEN n.custom_message
    ELSE n.predefined_message
  END AS final_message,
  n.is_bulk_notification,
  n.bulk_notification_id,
  n.is_read,
  n.sent_at,
  n.read_at,
  n.created_by
FROM notifications n
JOIN companies c ON n.company_id = c.company_id
JOIN students s ON n.student_id = s.student_id
ORDER BY n.sent_at DESC;

-- Sample data for testing (optional)
-- INSERT INTO notifications (company_id, student_id, application_status, message_type, predefined_message, created_by) 
-- VALUES (1, 1, 'shortlisted', 'predefined', 'Congratulations! Your application has been shortlisted for the next round.', 1);