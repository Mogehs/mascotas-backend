# Super Admin API Documentation

This document provides comprehensive documentation for all super admin-related API endpoints in the Mascotas Backend.

## Base URL

```
/superadmin
```

## Authentication

All endpoints require authentication with super admin privileges. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Note:** All endpoints require the user to have `role: "super_admin"` in their user profile.

---

## Table of Contents

1. [User Management](#user-management)
2. [Business Management](#business-management)
3. [Notification Management](#notification-management)
4. [Analytics & Reporting](#analytics--reporting)
5. [Error Responses](#error-responses)

---

## User Management

### 1. Get All Users with Analytics

**Endpoint:** `POST /superadmin/users`

**Description:** Retrieve all users with detailed analytics including orders, QR codes, business profiles, and subscription information.

**Request Body:**

```json
{
  "userId": "super_admin_user_id"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Users with analytics fetched successfully",
  "data": [
    {
      "_id": "user_id_1",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "phone": "+34123456789",
      "role": "user",
      "is_blocked": false,
      "business_subscription": true,
      "badge_subscription": false,
      "badge_name": null,
      "device_token": "fcm_device_token",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-07-20T14:30:00.000Z",
      "analytics": {
        "totalOrders": 5,
        "totalSpent": 149.95,
        "totalQRCodes": 3,
        "activeQRCodes": 2,
        "hasBusiness": true,
        "businessSubscription": {
          "is_active": true,
          "plan": "premium",
          "payment_status": "paid",
          "amount_paid": 29.99,
          "expires_at": "2025-08-15T10:00:00.000Z"
        },
        "registrationDate": "2025-01-15T10:00:00.000Z",
        "lastActivity": "2025-07-20T14:30:00.000Z",
        "subscriptions": {
          "business": true,
          "badge": false,
          "badgeName": null
        }
      }
    },
    {
      "_id": "user_id_2",
      "firstname": "Maria",
      "lastname": "Garcia",
      "email": "maria.garcia@example.com",
      "username": "mariagarcia",
      "phone": "+34987654321",
      "role": "user",
      "is_blocked": false,
      "business_subscription": false,
      "badge_subscription": true,
      "badge_name": "Premium Pet Owner",
      "device_token": "fcm_device_token_2",
      "createdAt": "2025-02-10T08:00:00.000Z",
      "updatedAt": "2025-07-19T16:45:00.000Z",
      "analytics": {
        "totalOrders": 2,
        "totalSpent": 45.99,
        "totalQRCodes": 1,
        "activeQRCodes": 1,
        "hasBusiness": false,
        "businessSubscription": null,
        "registrationDate": "2025-02-10T08:00:00.000Z",
        "lastActivity": "2025-07-19T16:45:00.000Z",
        "subscriptions": {
          "business": false,
          "badge": true,
          "badgeName": "Premium Pet Owner"
        }
      }
    }
  ]
}
```

**Error Responses:**

- `403` - Access denied (not super admin)
- `500` - Server error

---

## Business Management

### 2. Get All Business Profiles

**Endpoint:** `POST /superadmin/businesses`

**Description:** Retrieve all business profiles with owner information and subscription details.

**Request Body:**

```json
{
  "userId": "super_admin_user_id"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Business profiles fetched successfully",
  "data": [
    {
      "_id": "business_id_1",
      "id": {
        "_id": "user_id_1",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john.doe@example.com"
      },
      "business_name": "Pet Paradise Store",
      "business_address": "Calle Gran Via 123, Madrid, Spain",
      "business_phone": "+34912345678",
      "business_email": "info@petparadise.com",
      "business_type": "pet_store",
      "business_description": "Premium pet food and accessories store",
      "business_image": "https://cloudinary.com/business_image.jpg",
      "business_hours": {
        "monday": "09:00-20:00",
        "tuesday": "09:00-20:00",
        "wednesday": "09:00-20:00",
        "thursday": "09:00-20:00",
        "friday": "09:00-20:00",
        "saturday": "10:00-18:00",
        "sunday": "closed"
      },
      "is_blocked": false,
      "petpro_subscription": {
        "is_active": true,
        "plan": "premium",
        "payment_status": "paid",
        "amount_paid": 29.99,
        "started_at": "2025-06-15T10:00:00.000Z",
        "expires_at": "2025-08-15T10:00:00.000Z",
        "features": {
          "analytics_access": true,
          "priority_support": true,
          "advanced_features": true,
          "api_access": true
        }
      },
      "total_views": 1520,
      "total_clicks": 108,
      "monthly_views": 340,
      "monthly_clicks": 24,
      "overall_ctr": "7.11",
      "monthly_ctr": "7.06",
      "last_stats_update": "2025-07-20T10:00:00.000Z",
      "createdAt": "2025-06-15T10:00:00.000Z",
      "updatedAt": "2025-07-20T15:30:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `403` - Access denied (not super admin)
- `500` - Server error

---

## Notification Management

### 3. Send Push Notification to All Users

**Endpoint:** `POST /superadmin/send-notification`

**Description:** Send push notifications to all active users (excluding blocked users and super admins).

**Request Body:**

```json
{
  "userId": "super_admin_user_id",
  "title": "Important Update!",
  "message": "We've added new features to improve your pet care experience. Update the app now!",
  "notificationType": "app_update",
  "extraData": {
    "action": "update_app",
    "url": "https://play.google.com/store/apps/details?id=com.mascotas",
    "priority": "high"
  }
}
```

**Request Body Parameters:**

- `userId` (string, required) - Super admin user ID
- `title` (string, required) - Notification title
- `message` (string, required) - Notification message content
- `notificationType` (string, optional) - Type of notification (default: "admin_notification")
- `extraData` (object, optional) - Additional data to send with notification

**Success Response (200):**

```json
{
  "success": true,
  "message": "Notification broadcast completed! 1,245 delivered successfully, 15 failed.",
  "data": {
    "totalTargeted": 1260,
    "sentCount": 1245,
    "failedCount": 15,
    "results": [
      {
        "userId": "user_id_1",
        "username": "johndoe",
        "status": "sent"
      },
      {
        "userId": "user_id_2",
        "username": "mariagarcia",
        "status": "sent"
      },
      {
        "userId": "user_id_3",
        "username": "carloslopez",
        "status": "failed",
        "error": "Invalid device token"
      }
    ]
  }
}
```

**No Users Response (200):**

```json
{
  "success": true,
  "message": "No users available to send notifications to.",
  "data": {
    "totalTargeted": 0,
    "sentCount": 0,
    "failedCount": 0,
    "results": []
  }
}
```

**Error Responses:**

- `400` - Missing title or message
- `403` - Access denied (not super admin)
- `500` - Server error

---

## Analytics & Reporting

### 4. Get User Analytics

**Endpoint:** `POST /superadmin/analytics/users`

**Description:** Get comprehensive user registration and subscription analytics.

**Request Body:**

```json
{
  "userId": "super_admin_user_id"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User analytics fetched successfully",
  "data": {
    "totalUsers": 15420,
    "activeUsers": 8750,
    "subscriptions": {
      "business": 450,
      "badge": 1200,
      "total": 1650
    },
    "monthlyRegistrations": [
      {
        "_id": {
          "year": 2024,
          "month": 8
        },
        "count": 234
      },
      {
        "_id": {
          "year": 2024,
          "month": 9
        },
        "count": 289
      },
      {
        "_id": {
          "year": 2024,
          "month": 10
        },
        "count": 356
      },
      {
        "_id": {
          "year": 2024,
          "month": 11
        },
        "count": 412
      },
      {
        "_id": {
          "year": 2024,
          "month": 12
        },
        "count": 378
      },
      {
        "_id": {
          "year": 2025,
          "month": 1
        },
        "count": 445
      },
      {
        "_id": {
          "year": 2025,
          "month": 2
        },
        "count": 398
      },
      {
        "_id": {
          "year": 2025,
          "month": 3
        },
        "count": 467
      },
      {
        "_id": {
          "year": 2025,
          "month": 4
        },
        "count": 523
      },
      {
        "_id": {
          "year": 2025,
          "month": 5
        },
        "count": 489
      },
      {
        "_id": {
          "year": 2025,
          "month": 6
        },
        "count": 512
      },
      {
        "_id": {
          "year": 2025,
          "month": 7
        },
        "count": 378
      }
    ],
    "userGrowth": {
      "totalUsers": 15420,
      "activeUsersLast30Days": 8750,
      "subscriptionRate": "10.70%"
    }
  }
}
```

**Error Responses:**

- `403` - Access denied (not super admin)
- `500` - Server error

---

### 5. Get Sales Analytics

**Endpoint:** `POST /superadmin/analytics/sales`

**Description:** Get comprehensive sales analytics including QR codes, PetPro subscriptions, and order statistics.

**Request Body:**

```json
{
  "userId": "super_admin_user_id"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Sales analytics fetched successfully",
  "data": {
    "qrCodes": {
      "total": 25000,
      "active": 18750,
      "recentlyCreated": 1200,
      "activationRate": "75.00%"
    },
    "petProSubscriptions": {
      "totalBusinesses": 1250,
      "activeSubscriptions": 890,
      "paidSubscriptions": 785,
      "conversionRate": "62.80%",
      "subscriptionRevenue": 23456.75
    },
    "orders": {
      "totalOrders": 5680,
      "orderRevenue": 85467.25,
      "averageOrderValue": "15.05"
    },
    "monthlySales": [
      {
        "_id": {
          "year": 2025,
          "month": 6
        },
        "orderCount": 456,
        "revenue": 6890.45
      },
      {
        "_id": {
          "year": 2025,
          "month": 7
        },
        "orderCount": 523,
        "revenue": 7856.3
      }
    ],
    "totalRevenue": 108924.0
  }
}
```

**Error Responses:**

- `403` - Access denied (not super admin)
- `500` - Server error

---

## Error Responses

All endpoints may return the following error response format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes:

- `200` - Success
- `400` - Bad Request (missing required fields)
- `403` - Forbidden (not super admin)
- `500` - Internal Server Error

---

## Data Types Reference

### User Analytics Object

```typescript
{
  totalOrders: number,
  totalSpent: number,
  totalQRCodes: number,
  activeQRCodes: number,
  hasBusiness: boolean,
  businessSubscription: PetProSubscription | null,
  registrationDate: Date,
  lastActivity: Date,
  subscriptions: {
    business: boolean,
    badge: boolean,
    badgeName: string | null
  }
}
```

### PetPro Subscription Object

```typescript
{
  is_active: boolean,
  plan: "basic" | "premium",
  payment_status: "pending" | "paid" | "failed",
  amount_paid: number,
  started_at?: Date,
  expires_at?: Date,
  features?: {
    analytics_access?: boolean,
    priority_support?: boolean,
    advanced_features?: boolean,
    api_access?: boolean
  }
}
```

### Notification Types

```typescript
type NotificationType =
  | "admin_notification"
  | "app_update"
  | "maintenance"
  | "promotion"
  | "security_alert"
  | "feature_announcement";
```

---

## Usage Examples

### Frontend JavaScript Examples

#### 1. Get all users with analytics:

```javascript
const getAllUsersWithAnalytics = async () => {
  try {
    const response = await fetch("/superadmin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: superAdminUserId,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Users with analytics:", result.data);

      // Process user data
      result.data.forEach((user) => {
        console.log(`User: ${user.firstname} ${user.lastname}`);
        console.log(`Total spent: €${user.analytics.totalSpent}`);
        console.log(
          `QR codes: ${user.analytics.activeQRCodes}/${user.analytics.totalQRCodes}`
        );
        console.log(`Has business: ${user.analytics.hasBusiness}`);
      });

      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 2. Get all business profiles:

```javascript
const getAllBusinessProfiles = async () => {
  try {
    const response = await fetch("/superadmin/businesses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: superAdminUserId,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Business profiles:", result.data);

      // Process business data
      result.data.forEach((business) => {
        console.log(`Business: ${business.business_name}`);
        console.log(`Owner: ${business.id.firstname} ${business.id.lastname}`);
        console.log(
          `Subscription: ${business.petpro_subscription?.plan || "None"}`
        );
        console.log(`CTR: ${business.overall_ctr}%`);
      });

      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 3. Send push notification to all users:

```javascript
const sendNotificationToAllUsers = async (
  title,
  message,
  type = "admin_notification",
  extraData = {}
) => {
  try {
    const response = await fetch("/superadmin/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: superAdminUserId,
        title,
        message,
        notificationType: type,
        extraData,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Notification sent:", result.message);
      console.log(`Delivered to ${result.data.sentCount} users`);
      console.log(`Failed: ${result.data.failedCount} users`);

      // Process results for failed notifications
      const failedNotifications = result.data.results.filter(
        (r) => r.status === "failed"
      );
      if (failedNotifications.length > 0) {
        console.log("Failed notifications:", failedNotifications);
      }

      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Usage examples:
sendNotificationToAllUsers(
  "App Update Available",
  "Version 2.1.0 is now available with exciting new features!",
  "app_update",
  {
    action: "update_app",
    version: "2.1.0",
    url: "https://play.google.com/store/apps/details?id=com.mascotas",
  }
);

sendNotificationToAllUsers(
  "Maintenance Notice",
  "The app will be under maintenance tomorrow from 2:00 AM to 4:00 AM.",
  "maintenance",
  {
    start_time: "2025-07-21T02:00:00Z",
    end_time: "2025-07-21T04:00:00Z",
  }
);
```

#### 4. Get user analytics:

```javascript
const getUserAnalytics = async () => {
  try {
    const response = await fetch("/superadmin/analytics/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: superAdminUserId,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("User analytics:", result.data);

      const analytics = result.data;
      console.log(`Total users: ${analytics.totalUsers.toLocaleString()}`);
      console.log(
        `Active users (30d): ${analytics.activeUsers.toLocaleString()}`
      );
      console.log(
        `Subscription rate: ${analytics.userGrowth.subscriptionRate}`
      );

      // Process monthly registrations for chart
      analytics.monthlyRegistrations.forEach((month) => {
        console.log(
          `${month._id.year}-${month._id.month}: ${month.count} registrations`
        );
      });

      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 5. Get sales analytics:

```javascript
const getSalesAnalytics = async () => {
  try {
    const response = await fetch("/superadmin/analytics/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: superAdminUserId,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Sales analytics:", result.data);

      const sales = result.data;
      console.log(`Total revenue: €${sales.totalRevenue.toLocaleString()}`);
      console.log(`QR activation rate: ${sales.qrCodes.activationRate}`);
      console.log(
        `PetPro conversion rate: ${sales.petProSubscriptions.conversionRate}`
      );
      console.log(`Average order value: €${sales.orders.averageOrderValue}`);

      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 6. React hook for super admin dashboard:

```javascript
import { useState, useEffect, useCallback } from "react";

const useSuperAdminDashboard = (superAdminUserId) => {
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [usersRes, businessesRes, userAnalyticsRes, salesAnalyticsRes] =
        await Promise.all([
          fetch("/superadmin/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId: superAdminUserId }),
          }),
          fetch("/superadmin/businesses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId: superAdminUserId }),
          }),
          fetch("/superadmin/analytics/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId: superAdminUserId }),
          }),
          fetch("/superadmin/analytics/sales", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId: superAdminUserId }),
          }),
        ]);

      const [usersData, businessesData, userAnalyticsData, salesAnalyticsData] =
        await Promise.all([
          usersRes.json(),
          businessesRes.json(),
          userAnalyticsRes.json(),
          salesAnalyticsRes.json(),
        ]);

      if (usersData.success) setUsers(usersData.data);
      if (businessesData.success) setBusinesses(businessesData.data);
      if (userAnalyticsData.success) setUserAnalytics(userAnalyticsData.data);
      if (salesAnalyticsData.success)
        setSalesAnalytics(salesAnalyticsData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [superAdminUserId]);

  const sendNotification = useCallback(
    async (title, message, type, extraData) => {
      try {
        const response = await fetch("/superadmin/send-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: superAdminUserId,
            title,
            message,
            notificationType: type,
            extraData,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message);
        }

        return result.data;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [superAdminUserId]
  );

  useEffect(() => {
    if (superAdminUserId) {
      fetchAllData();
    }
  }, [superAdminUserId, fetchAllData]);

  return {
    users,
    businesses,
    userAnalytics,
    salesAnalytics,
    loading,
    error,
    fetchAllData,
    sendNotification,
    setError,
  };
};

export default useSuperAdminDashboard;
```

#### 7. Super admin dashboard component:

```javascript
const SuperAdminDashboard = ({ superAdminUserId }) => {
  const {
    users,
    businesses,
    userAnalytics,
    salesAnalytics,
    loading,
    error,
    sendNotification,
  } = useSuperAdminDashboard(superAdminUserId);

  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "admin_notification",
  });

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const result = await sendNotification(
        notificationForm.title,
        notificationForm.message,
        notificationForm.type,
        {}
      );

      alert(`Notification sent to ${result.sentCount} users successfully!`);
      setNotificationForm({
        title: "",
        message: "",
        type: "admin_notification",
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="super-admin-dashboard">
      <h1>Super Admin Dashboard</h1>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{userAnalytics?.totalUsers.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{userAnalytics?.activeUsers.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Businesses</h3>
          <p>{businesses.length.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>€{salesAnalytics?.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Notification Form */}
      <div className="notification-section">
        <h2>Send Notification to All Users</h2>
        <form onSubmit={handleSendNotification}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={notificationForm.title}
              onChange={(e) =>
                setNotificationForm({
                  ...notificationForm,
                  title: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <label>Message:</label>
            <textarea
              value={notificationForm.message}
              onChange={(e) =>
                setNotificationForm({
                  ...notificationForm,
                  message: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <label>Type:</label>
            <select
              value={notificationForm.type}
              onChange={(e) =>
                setNotificationForm({
                  ...notificationForm,
                  type: e.target.value,
                })
              }
            >
              <option value="admin_notification">Admin Notification</option>
              <option value="app_update">App Update</option>
              <option value="maintenance">Maintenance</option>
              <option value="promotion">Promotion</option>
            </select>
          </div>
          <button type="submit">Send Notification</button>
        </form>
      </div>

      {/* Users Table */}
      <div className="users-section">
        <h2>Recent Users ({users.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Total Spent</th>
              <th>QR Codes</th>
              <th>Subscriptions</th>
              <th>Registration</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 10).map((user) => (
              <tr key={user._id}>
                <td>
                  {user.firstname} {user.lastname}
                </td>
                <td>{user.email}</td>
                <td>€{user.analytics.totalSpent.toFixed(2)}</td>
                <td>
                  {user.analytics.activeQRCodes}/{user.analytics.totalQRCodes}
                </td>
                <td>
                  {user.analytics.subscriptions.business && "Business "}
                  {user.analytics.subscriptions.badge && "Badge"}
                </td>
                <td>
                  {new Date(
                    user.analytics.registrationDate
                  ).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Business Table */}
      <div className="businesses-section">
        <h2>Business Profiles ({businesses.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Owner</th>
              <th>Subscription</th>
              <th>CTR</th>
              <th>Views</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {businesses.slice(0, 10).map((business) => (
              <tr key={business._id}>
                <td>{business.business_name}</td>
                <td>
                  {business.id.firstname} {business.id.lastname}
                </td>
                <td>{business.petpro_subscription?.plan || "None"}</td>
                <td>{business.overall_ctr}%</td>
                <td>{business.total_views}</td>
                <td>{business.is_blocked ? "Blocked" : "Active"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

---

## Business Logic Notes

### Super Admin Access:

- All endpoints require `role: "super_admin"`
- Super admins cannot be blocked by other super admins
- Super admins are excluded from notification broadcasts

### User Analytics:

- **Total Users**: All registered users
- **Active Users**: Users with activity in last 30 days
- **Monthly Registrations**: Last 12 months of registration data
- **Subscription Rate**: Percentage of users with any subscription

### Sales Analytics:

- **QR Codes**: Physical tags that users can purchase and activate
- **PetPro Subscriptions**: Business subscription revenue
- **Orders**: Product orders and tag purchases
- **Total Revenue**: Combined subscription and order revenue

### Notification System:

- Targets all active users with device tokens
- Excludes blocked users and super admins
- Provides detailed delivery reports
- Supports custom notification types and extra data

### Business Management:

- View all business profiles with owner details
- Access subscription and performance metrics
- Monitor business activity and compliance

---

## Notes for Frontend Developers

1. **Super Admin Only**: All endpoints require super admin role verification.

2. **Bulk Operations**: Notification sending processes large user lists efficiently.

3. **Rich Analytics**: User and sales analytics provide comprehensive business insights.

4. **Real-time Data**: All data is fetched in real-time without caching.

5. **Error Handling**: Handle 403 errors for non-super admin access attempts.

6. **Notification Tracking**: Monitor delivery success/failure rates for notifications.

7. **Data Export**: Consider implementing CSV export for analytics data.

8. **Pagination**: Implement pagination for large user/business lists.

9. **Search/Filter**: Add search and filter capabilities for user/business management.

10. **Dashboard Widgets**: Use analytics data for visual dashboard components.

---

This documentation provides comprehensive guidance for implementing super admin functionality with full system oversight, user management, notification broadcasting, and detailed analytics reporting.
