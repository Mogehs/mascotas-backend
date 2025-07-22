# Super Admin API Documentation

This documentation covers all the Super Admin API endpoints for managing users, businesses, analytics, and notifications.

## Base URL

```
/superadmin
```

## Authentication

No authentication required for any super admin endpoints.

---

## 1. Get All Users

**Endpoint:** `GET /superadmin/users`

**Description:** Retrieves all users with detailed analytics including orders, QR codes, and business profiles.

### Request

- **Method:** GET
- **Parameters:** None required

### Response

```json
{
  "success": true,
  "message": "Users with analytics fetched successfully",
  "data": [
    {
      "_id": "user_id",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "role": "user",
      "is_blocked": false,
      "business_subscription": true,
      "badge_subscription": false,
      "badge_name": "Premium",
      "device_token": "device_token_string",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "analytics": {
        "totalOrders": 5,
        "totalSpent": 150.0,
        "totalQRCodes": 3,
        "activeQRCodes": 2,
        "hasBusiness": true,
        "businessSubscription": {
          "is_active": true,
          "plan": "premium",
          "amount_paid": 29.99
        },
        "registrationDate": "2023-01-01T00:00:00.000Z",
        "lastActivity": "2023-01-01T00:00:00.000Z",
        "subscriptions": {
          "business": true,
          "badge": false,
          "badgeName": "Premium"
        }
      }
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 2. Get All Business Profiles

**Endpoint:** `GET /superadmin/businesses`

**Description:** Retrieves all business profiles with populated user information.

### Request

- **Method:** GET
- **Parameters:** None required

### Response

```json
{
  "success": true,
  "message": "Business profiles fetched successfully",
  "data": [
    {
      "_id": "business_id",
      "company_name": "Pet Store Inc",
      "company_logo": "https://example.com/logo.jpg",
      "business_type": "pet_store",
      "phone": "+1234567890",
      "email": "info@petstore.com",
      "website": "https://petstore.com",
      "physical_address": "123 Pet Street, City, State",
      "is_blocked": false,
      "petpro_subscription": {
        "is_active": true,
        "plan": "premium",
        "start_date": "2023-01-01T00:00:00.000Z",
        "end_date": "2023-12-31T23:59:59.999Z",
        "payment_status": "paid",
        "amount_paid": 299.99
      },
      "features": {
        "can_showcase_products": true,
        "can_create_ads": true,
        "can_create_featured_ads": true,
        "max_products": 100,
        "max_ads": 50,
        "max_featured_ads": 10,
        "analytics_access": true
      },
      "statistics": {
        "total_views": 1500,
        "total_clicks": 300,
        "monthly_views": 450,
        "monthly_clicks": 90
      },
      "id": {
        "_id": "user_id",
        "firstname": "Business",
        "lastname": "Owner",
        "email": "owner@petstore.com"
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 3. Send Push Notification

**Endpoint:** `POST /superadmin/send-notification`

**Description:** Send push notifications to all active users with device tokens.

### Request

- **Method:** POST
- **Content-Type:** application/json
- **Body:**

```json
{
  "title": "Notification Title",
  "message": "Notification message content",
  "notificationType": "admin_notification",
  "extraData": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

#### Body Parameters:

- `title` (required): The notification title
- `message` (required): The notification message
- `notificationType` (optional): Type of notification (default: "admin_notification")
- `extraData` (optional): Additional data to send with notification

### Response

```json
{
  "success": true,
  "message": "Notification broadcast completed! 150 delivered successfully, 5 failed.",
  "data": {
    "totalTargeted": 155,
    "sentCount": 150,
    "failedCount": 5,
    "results": [
      {
        "userId": "64a1b2c3d4e5f6789012345",
        "username": "johndoe",
        "status": "sent"
      },
      {
        "userId": "64a1b2c3d4e5f6789012346",
        "username": "janedoe",
        "status": "failed",
        "error": "Invalid device token"
      }
    ]
  }
}
```

### No Users Available Response

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

### Error Response

```json
{
  "success": false,
  "message": "Title and message are required."
}
```

---

## 4. Get User Analytics

**Endpoint:** `GET /superadmin/analytics/users`

**Description:** Get comprehensive user registration and subscription analytics.

### Request

- **Method:** GET
- **Parameters:** None required

### Response

```json
{
  "success": true,
  "message": "User analytics fetched successfully",
  "data": {
    "totalUsers": 1500,
    "activeUsers": 1200,
    "subscriptions": {
      "business": 250,
      "badge": 150,
      "total": 400
    },
    "monthlyRegistrations": [
      {
        "_id": {
          "year": 2023,
          "month": 1
        },
        "count": 45
      },
      {
        "_id": {
          "year": 2023,
          "month": 2
        },
        "count": 52
      }
    ],
    "userGrowth": {
      "totalUsers": 1500,
      "activeUsersLast30Days": 1200,
      "subscriptionRate": "26.67%"
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 5. Get Sales Analytics

**Endpoint:** `GET /superadmin/analytics/sales`

**Description:** Get comprehensive sales analytics including QR codes, subscriptions, and orders.

### Request

- **Method:** GET
- **Parameters:** None required

### Response

```json
{
  "success": true,
  "message": "Sales analytics fetched successfully",
  "data": {
    "qrCodes": {
      "total": 5000,
      "active": 4200,
      "recentlyCreated": 150,
      "activationRate": "84.00%"
    },
    "petProSubscriptions": {
      "totalBusinesses": 300,
      "activeSubscriptions": 250,
      "paidSubscriptions": 240,
      "conversionRate": "80.00%",
      "subscriptionRevenue": 71976.0
    },
    "orders": {
      "totalOrders": 1200,
      "orderRevenue": 45000.0,
      "averageOrderValue": "37.50"
    },
    "monthlySales": [
      {
        "_id": {
          "year": 2023,
          "month": 12
        },
        "orderCount": 120,
        "revenue": 4500.0
      }
    ],
    "totalRevenue": 116976.0
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Status Codes

- **200 OK**: Request successful
- **400 Bad Request**: Invalid request parameters
- **403 Forbidden**: Action not allowed (e.g., blocking super admin)
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Notes

1. **No Authentication Required**: All endpoints are accessible without authentication or admin validation.

2. **User Filtering**: The send notification endpoint automatically excludes:

   - Blocked users (`is_blocked: true`)
   - Super admin users (`role: "super_admin"`)
   - Users without device tokens

3. **Analytics Data**: Analytics endpoints provide real-time calculations without relying on cached data.

4. **Error Handling**: All endpoints include proper error handling with descriptive error messages.

5. **Data Types**:

   - Dates are in ISO 8601 format
   - Revenue amounts are in decimal format
   - Percentages are strings with "%" suffix
   - User IDs are MongoDB ObjectId strings

6. **Business Logic**:
   - Cannot block super admin users
   - Business and user toggle actions only accept "block" or "unblock"
   - Notification targeting excludes inappropriate user types automatically
