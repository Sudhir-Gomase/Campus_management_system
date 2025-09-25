// Test notification system API endpoints
import fetch from "node-fetch";

const BASE_URL = "http://localhost:4000";
const TEST_JWT = "your-test-jwt-token"; // You'll need to get this from login

async function testNotificationEndpoints() {
  console.log("🧪 Testing Notification System API Endpoints...\n");

  try {
    // Test 1: Get notification templates
    console.log("1️⃣  Testing: GET /notification/templates");
    try {
      const response = await fetch(`${BASE_URL}/notification/templates`, {
        headers: {
          Authorization: `Bearer ${TEST_JWT}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Templates retrieved successfully");
        console.log(`📝 Found ${data.data.length} templates`);
      } else {
        console.log(`❌ Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log("\n");

    // Test 2: Send single notification (sample data)
    console.log("2️⃣  Testing: POST /notification/company/send");
    const singleNotificationData = {
      student_id: 1,
      application_status: "shortlisted",
      message_type: "predefined",
    };

    try {
      const response = await fetch(`${BASE_URL}/notification/company/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TEST_JWT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(singleNotificationData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Single notification sent successfully");
        console.log(`📧 Notification ID: ${data.data.notification_id}`);
      } else {
        console.log(`❌ Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log("\n");

    // Test 3: Get student notifications
    console.log("3️⃣  Testing: GET /notification/student/1/notifications");
    try {
      const response = await fetch(
        `${BASE_URL}/notification/student/1/notifications`,
        {
          headers: {
            Authorization: `Bearer ${TEST_JWT}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Student notifications retrieved successfully");
        console.log(`📬 Found ${data.data.length} notifications`);
      } else {
        console.log(`❌ Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  } catch (error) {
    console.error("❌ General test error:", error.message);
  }
}

// Instructions for running the test
console.log(`
🚀 Notification System API Test Script

📋 Instructions:
1. Start the server: node app.js
2. Login to get a JWT token
3. Replace TEST_JWT variable with your actual token
4. Run this test: node test_notifications.js

🔧 API Endpoints Available:
- GET /notification/templates
- POST /notification/company/send
- POST /notification/company/send-bulk
- GET /notification/student/:studentId/notifications
- PUT /notification/student/:notificationId/read

🎯 Status Enum Values: applied, shortlisted, interviewed, selected, rejected
`);

// Uncomment the line below to run the actual tests
// testNotificationEndpoints();
