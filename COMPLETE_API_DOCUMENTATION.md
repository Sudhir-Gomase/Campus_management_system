# 🎓 Campus Placement Management System - Complete API Documentation

## 🚀 Overview

Complete campus placement management system with Admin, Student, and Company portals.

**Server Configuration:**

- Backend Port: `4000`
- Frontend Port: `3000`
- Database: MySQL/MariaDB

---

## 🔐 Authentication

All endpoints except login routes require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

**Public Routes (No Auth Required):**

- `POST /adminlogin`
- `POST /studentlogin`
- `POST /companylogin`
- `POST /companyregistration`

---

## 👨‍💼 ADMIN SECTION

### Authentication

```http
POST /adminlogin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "adminId": 1,
    "expireIn": "24h",
    "role": "admin",
    "email": "admin@example.com",
    "name": "Admin Name",
    "phone": "1234567890"
  },
  "message": "Login successful"
}
```

### Department Management

```http
GET /departments
GET /departments?id=1
```

### Company Management

```http
# Get all companies (with approval filter)
GET /overallcompanydata
GET /overallcompanydata?is_approved=true

# Approve/Reject company
PUT /overallcompanydata/{company_id}/{is_approved}
```

### Student Management

```http
# Add new student
POST /addstudent
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "roll_no": "CS2023001",
  "department_id": 1,
  "password": "password123"
}

# Search students by name or roll number
GET /searchstudent?query=john

# Delete student
DELETE /deletestudent/{student_id}

# Bulk student registration
POST /registerbulkemployee/{department_id}
Content-Type: multipart/form-data
```

### Analytics & Reports

```http
# Academic year data with filters
GET /academicyeardata?year=2024-2025&department_id=1&company_id=1&status=selected

# Company list
GET /companylist

# Donut chart data for dashboard
GET /donutgraphdata?department_id=1

# Download CSV template
GET /downloadtemplate
```

### Admin Profile

```http
POST /admindataupdate/{admin_id}
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "9876543210",
  "password": "newpassword"
}
```

---

## 🎓 STUDENT SECTION

### Authentication

```http
POST /studentlogin
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

### Profile Management

```http
# Get student data
GET /studentdata/{student_id}

# Update profile
POST /studentprofileupdate
Content-Type: application/json

{
  "student_id": 1,
  "full_name": "Updated Name",
  "phone": "9876543210",
  "technical_skills": "Java, Python, React"
}
```

### Company Applications

```http
# Get available companies (not applied to)
GET /allcompanylistforstudent/{student_id}

# Apply to company
POST /studentapplied
Content-Type: application/json

{
  "student_id": 1,
  "company_id": 1
}

# Get ongoing application processes
GET /ongoingprocess/{student_id}
```

### Notifications

```http
# Get student notifications
GET /notification/student/{student_id}/notifications

# Mark notification as read
PUT /notification/student/{notification_id}/read
```

---

## 🏢 COMPANY SECTION

### Authentication

```http
POST /companyregistration
Content-Type: application/json

{
  "name": "Tech Company Ltd",
  "username": "techcompany",
  "password": "password123",
  "contact_email": "hr@techcompany.com",
  "contact_phone": "1234567890",
  "ctc_offered": 500000,
  "industry_type": "IT"
}

POST /companylogin
Content-Type: application/json

{
  "username": "techcompany",
  "password": "password123"
}
```

### Profile Management

```http
# Get company profile
GET /getcompany/{company_id}

# Update company profile
PUT /updatecompany/{company_id}
Content-Type: application/json

{
  "ctc_offered": 600000,
  "joining_date": "2024-07-01",
  "bond_details": "2 years service bond"
}
```

### Application Management

```http
# Get all applications to this company
GET /company/{company_id}/applications

# Update application status
PUT /company/{company_id}/application/{student_id}/status
Content-Type: application/json

{
  "status": "shortlisted"
}
```

### Notification System

```http
# Get predefined templates
GET /notification/templates

# Send single notification
POST /notification/company/send
Content-Type: application/json

{
  "company_id": 1,
  "student_id": 1,
  "application_status": "shortlisted",
  "message_type": "predefined"
}

# Send bulk notifications
POST /notification/company/send-bulk
Content-Type: application/json

{
  "company_id": 1,
  "student_ids": [1, 2, 3],
  "application_status": "interviewed",
  "message_type": "custom",
  "custom_message": "Your interview is scheduled for tomorrow at 10 AM"
}
```

---

## 📊 Status Values

**Application Status ENUM:**

- `applied` - Initial application
- `shortlisted` - Application shortlisted
- `interviewed` - Interview completed
- `selected` - Candidate selected
- `rejected` - Application rejected

**Message Types:**

- `predefined` - Use template message
- `custom` - Use custom message

---

## 🐛 Bug Fixes Applied

### Fixed Issues:

1. **Port Mismatch** - Updated frontend API base URL from 5000 to 4000
2. **Company Login Bug** - Fixed typo in SQL query (`usernam`e`→`username`)
3. **JWT Auth** - Added company routes to public routes list
4. **Company Login Flow** - Added JWT token generation for company login
5. **Missing Routes** - Added student search, application status update routes
6. **Notification Integration** - Connected notification system with application status changes

### Enhanced Features:

1. **Student Search** - Admin can search students by name or roll number with application history
2. **Application Status Updates** - Companies can update student application status
3. **Comprehensive Notifications** - Full notification system with predefined and custom messages
4. **Bulk Operations** - Bulk student registration and bulk notifications

---

## 🚀 Ready to Use!

The system now supports:

**👨‍💼 Admin Features:**

- ✅ Company approval/rejection
- ✅ Student management (add, search, delete, bulk import)
- ✅ Department-wise analytics with donut charts
- ✅ Academic year filtering
- ✅ Profile management

**🎓 Student Features:**

- ✅ Profile updates
- ✅ Company applications
- ✅ Application status tracking
- ✅ Notification viewing

**🏢 Company Features:**

- ✅ Profile management
- ✅ View student applications
- ✅ Update application status
- ✅ Send notifications (single/bulk)
- ✅ Custom and predefined messages

All flows are tested and working correctly! 🎉
