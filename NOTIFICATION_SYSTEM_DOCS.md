# Notification System Documentation

## Overview

The notification system allows companies to send notifications to students about their application status (applied, shortlisted, interviewed, selected, rejected) with either custom messages or pre-populated templates. The system supports both single and bulk notifications.

**Important:** The notification status values are aligned with your existing `student_companies.placement_status` enum values for consistency.

## Database Schema

### Tables Created

1. **notifications** - Main notifications table
2. **notification_templates** - Pre-defined message templates
3. **notification_details** - View for easy retrieval with company and student details

### Key Features

- Single and bulk notifications
- Custom or pre-defined messages
- Read/unread status tracking
- Application status-based templates
- Notification statistics and analytics

## API Endpoints

### Company Routes (Sending Notifications)

#### 1. Send Single Notification

```http
POST /notifications/send-single
```

**Request Body:**

```json
{
  "company_id": 1,
  "student_id": 1,
  "application_status": "shortlisted",
  "message_type": "custom",
  "custom_message": "Congratulations! You've been shortlisted. Your interview is scheduled for tomorrow at 2 PM."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "notification_id": 1,
    "message": "Notification sent successfully",
    "student_details": {
      "name": "John Doe",
      "email": "john@example.com",
      "roll_no": "CS001"
    }
  },
  "message": "Notification sent successfully"
}
```

#### 2. Send Bulk Notifications

```http
POST /notifications/send-bulk
```

**Request Body:**

```json
{
  "company_id": 1,
  "student_ids": [1, 2, 3, 4, 5],
  "application_status": "selected",
  "message_type": "predefined"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bulk_notification_id": "uuid-string",
    "total_notifications_sent": 5,
    "message": "Bulk notifications sent successfully",
    "student_details": [...]
  },
  "message": "Bulk notifications sent successfully"
}
```

#### 3. Get Company Applicants

```http
GET /notifications/company/{company_id}/applicants?status=applied
```

**Response:**

```json
{
  "success": true,
  "data": {
    "company_id": 1,
    "filter_status": "applied",
    "total_applicants": 10,
    "applicants": [
      {
        "student_id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "roll_no": "CS001",
        "placement_status": "applied",
        "applied_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### 4. Get Company Notifications

```http
GET /notifications/company/{company_id}?page=1&limit=20
```

#### 5. Get Notification Statistics

```http
GET /notifications/company/{company_id}/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total_notifications": 50,
    "by_status": {
      "shortlisted": 15,
      "selected": 10,
      "rejected": 20,
      "interviewed": 5
    },
    "by_type": {
      "custom": 30,
      "predefined": 20
    },
    "read_rate": 75,
    "recent_notifications": [...]
  }
}
```

#### 6. Send Status Update Notification

```http
POST /notifications/status-update
```

**Request Body:**

```json
{
  "student_id": 1,
  "company_id": 1,
  "new_status": "interviewed",
  "custom_message": "Your interview is completed. Results will be announced soon."
}
```

### Student Routes (Receiving Notifications)

#### 1. Get Student Notifications

```http
GET /notifications/student/{student_id}?page=1&limit=20
```

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notification_id": 1,
        "company_name": "TechCorp",
        "application_status": "shortlisted",
        "final_message": "Congratulations! Your application has been shortlisted...",
        "is_read": false,
        "sent_at": "2024-01-15T10:30:00Z"
      }
    ],
    "unread_count": 5,
    "total": 20,
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "has_more": true
    }
  }
}
```

#### 2. Mark Notification as Read

```http
PUT /notifications/{notification_id}/read
```

**Request Body:**

```json
{
  "student_id": 1
}
```

#### 3. Mark All Notifications as Read

```http
PUT /notifications/student/{student_id}/read-all
```

### Template Management Routes

#### 1. Get Notification Templates

```http
GET /notifications/templates?status=shortlisted
```

#### 2. Update Notification Template

```http
PUT /notifications/templates/{template_id}
```

**Request Body:**

```json
{
  "template_title": "Updated Title",
  "template_message": "Updated message content",
  "is_active": true
}
```

## Application Status Values

- `applied` - Student has applied for the position (initial status)
- `shortlisted` - Student has been shortlisted for next round
- `interviewed` - Student has completed the interview
- `selected` - Student has been selected for the position
- `rejected` - Student's application has been rejected

**Note:** These status values align with the existing `student_companies.placement_status` column in your database.

## Message Types

- `predefined` - Uses pre-defined templates from the database
- `custom` - Uses custom message provided in the request

## Usage Examples

### Scenario 1: Company wants to notify shortlisted students

1. First, get applicants who applied:

```http
GET /notifications/company/1/applicants?status=applied
```

2. Send bulk notification to shortlisted students:

```http
POST /notifications/send-bulk
{
  "company_id": 1,
  "student_ids": [1, 2, 3, 4, 5],
  "application_status": "shortlisted",
  "message_type": "custom",
  "custom_message": "Congratulations! You have been shortlisted. Your interview is scheduled for January 20th at 2 PM in the campus placement office. Please bring your original documents."
}
```

### Scenario 2: Student wants to check notifications

```http
GET /notifications/student/1
```

### Scenario 3: Company wants to see notification statistics

```http
GET /notifications/company/1/stats
```

## Error Handling

The system includes comprehensive error handling for:

- Invalid application status
- Missing required fields
- Message length validation
- Bulk notification limits (max 100 students)
- Authentication and authorization
- Database errors

## Database Installation

Run the SQL script to create the necessary tables:

```sql
-- Execute the create_notifications_table.sql script
-- This will create:
-- 1. notifications table
-- 2. notification_templates table
-- 3. notification_details view
-- 4. Default template data
```

## Notes

- Bulk notifications are limited to 100 students per request
- Custom messages cannot exceed 1000 characters
- All notifications are automatically timestamped
- Read status is tracked per student
- Companies can only access their own notifications
- Students can only access their own notifications

## Security Considerations

- JWT authentication required for all endpoints
- Company can only send notifications for their applications
- Students can only read their own notifications
- Input validation and sanitization implemented
- SQL injection protection through Knex.js
