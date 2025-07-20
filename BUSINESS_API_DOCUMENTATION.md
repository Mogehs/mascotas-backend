# Business API Documentation

This document provides comprehensive documentation for all business-related API endpoints in the Mascotas Backend.

## Base URL

```
/business
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Business Registration & Management](#business-registration--management)
2. [PetPro Subscription Management](#petpro-subscription-management)
3. [Error Responses](#error-responses)

---

## Business Registration & Management

### 1. Register Business

**Endpoint:** `POST /business/register`

**Description:** Register a new business for a user account.

**Request Body:**

```json
{
  "id": "string", // Required - User ID (MongoDB ObjectId)
  "name": "string", // Required - Company name
  "type": "string", // Required - Company type (e.g., "Veterinary", "Pet Store")
  "description": "string", // Optional - Company description
  "branch": "string", // Optional - Branch information
  "phone": "string", // Optional - Phone number
  "email": "string", // Optional - Email address
  "website": "string", // Optional - Website URL
  "address": "string", // Optional - Physical address
  "operation_timings": {}, // Optional - Operation timings object
  "tax": "string", // Optional - Tax identification number
  "addition": "string" // Optional - Additional information
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Business information saved successfully",
  "business": "business_id_here"
}
```

**Error Responses:**

- `400` - Missing required fields (id, name, type)
- `404` - User not found
- `400` - User already has a business registered
- `500` - Server error

---

### 2. Upload Business Image

**Endpoint:** `POST /business/image`

**Description:** Upload a logo/image for the business.

**Content-Type:** `multipart/form-data`

**Request Body:**

```
uid: string                        // Required - Business ID
picture: file                      // Required - Image file (uploaded as form data)
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Imagen cargada exitosamente"
}
```

**Error Responses:**

- `400` - Missing business ID or image file
- `404` - Business not found
- `500` - Server error

---

### 3. Upload Location Coordinates

**Endpoint:** `POST /business/latlng`

**Description:** Upload latitude and longitude coordinates for the business location.

**Request Body:**

```json
{
  "uid": "string", // Required - Business ID
  "lat": "number", // Required - Latitude (-90 to 90)
  "lon": "number" // Required - Longitude (-180 to 180)
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "El formulario comercial se ha completado con éxito"
}
```

**Error Responses:**

- `400` - Missing business ID, latitude, or longitude
- `400` - Invalid latitude/longitude ranges
- `404` - Business not found
- `500` - Server error

---

### 4. Get All Businesses

**Endpoint:** `GET /business/`

**Description:** Retrieve a list of all registered businesses.

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "Business are fetcched",
  "data": [
    {
      "_id": "business_id",
      "company_name": "string",
      "company_type": "string",
      "company_description": "string",
      "company_logo": "string",
      "phone": "string",
      "email": "string",
      "website": "string",
      "physical_address": "string",
      "branches": "string",
      "additional": "string",
      "latitude": "string",
      "longitude": "string",
      "operation_timing": {},
      "tax_identification_number": "string",
      "petpro_subscription": {
        "is_active": "boolean",
        "subscription_type": "string",
        "start_date": "date",
        "end_date": "date",
        "payment_status": "string",
        "amount_paid": "number",
        "payment_method": "string"
      },
      "features": {
        "can_create_featured_ads": "boolean",
        "max_featured_ads": "number",
        "can_showcase_products": "boolean",
        "max_products": "number",
        "can_create_promotions": "boolean",
        "max_promotions": "number",
        "analytics_access": "boolean"
      },
      "statistics": {
        "total_views": "number",
        "total_clicks": "number",
        "monthly_views": "number",
        "monthly_clicks": "number",
        "last_stats_update": "date"
      },
      "is_blocked": "boolean",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

**Error Responses:**

- `500` - Server error

---

### 5. Update Business Information

**Endpoint:** `POST /business/updateBusiness`

**Description:** Update existing business information.

**Request Body:**

```json
{
  "id": "string", // Required - Business ID
  "name": "string", // Optional - Company name
  "type": "string", // Optional - Company type
  "description": "string", // Optional - Company description
  "branch": "string", // Optional - Branch information
  "phone": "string", // Optional - Phone number
  "email": "string", // Optional - Email address
  "website": "string", // Optional - Website URL
  "address": "string", // Optional - Physical address
  "operation_timings": {}, // Optional - Operation timings object
  "tax": "string", // Optional - Tax identification number
  "addition": "string" // Optional - Additional information
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "El formulario comercial se ha completado con éxito",
  "business": "business_id_here"
}
```

**Error Responses:**

- `400` - Missing business ID
- `404` - Business not found
- `500` - Server error

---

## PetPro Subscription Management

### 6. Activate PetPro Subscription

**Endpoint:** `POST /business/petpro/activate`

**Description:** Activate a PetPro subscription for a business.

**Request Body:**

```json
{
  "business_id": "string", // Required - Business ID
  "subscription_type": "string", // Optional - "premium" or "basic" (default: "premium")
  "payment_method": "string", // Required - Payment method used
  "amount_paid": "number" // Optional - Amount paid (default: 49)
}
```

**Subscription Types & Features:**

**Premium Subscription:**

- `max_featured_ads`: 10
- `max_products`: 100
- `max_promotions`: 20
- Full analytics access

**Basic Subscription:**

- `max_featured_ads`: 3
- `max_products`: 25
- `max_promotions`: 5
- Full analytics access

**Success Response (200):**

```json
{
  "success": true,
  "message": "PetPro subscription activated successfully",
  "data": {
    "subscription": {
      "is_active": true,
      "subscription_type": "premium",
      "start_date": "2025-07-20T00:00:00.000Z",
      "end_date": "2026-07-20T00:00:00.000Z",
      "payment_status": "paid",
      "amount_paid": 49,
      "payment_method": "credit_card"
    },
    "features": {
      "can_create_featured_ads": true,
      "max_featured_ads": 10,
      "can_showcase_products": true,
      "max_products": 100,
      "can_create_promotions": true,
      "max_promotions": 20,
      "analytics_access": true
    }
  }
}
```

**Error Responses:**

- `400` - Missing business ID or payment method
- `400` - Invalid subscription type
- `400` - Invalid amount paid
- `404` - Business not found
- `500` - Server error

---

### 7. Check Subscription Status

**Endpoint:** `GET /business/petpro/status/:business_id`

**Description:** Check the current subscription status and features for a business.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "business_name": "Pet Store Example",
    "subscription": {
      "is_active": true,
      "subscription_type": "premium",
      "start_date": "2025-07-20T00:00:00.000Z",
      "end_date": "2026-07-20T00:00:00.000Z",
      "payment_status": "paid",
      "amount_paid": 49,
      "payment_method": "credit_card"
    },
    "features": {
      "can_create_featured_ads": true,
      "max_featured_ads": 10,
      "can_showcase_products": true,
      "max_products": 100,
      "can_create_promotions": true,
      "max_promotions": 20,
      "analytics_access": true
    },
    "statistics": {
      "total_views": 150,
      "total_clicks": 45,
      "monthly_views": 50,
      "monthly_clicks": 15,
      "last_stats_update": "2025-07-20T00:00:00.000Z"
    },
    "is_expired": false
  }
}
```

**Error Responses:**

- `404` - Business not found
- `500` - Server error

---

### 8. Renew Subscription

**Endpoint:** `POST /business/petpro/renew/:business_id`

**Description:** Renew an existing subscription for one more year.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Request Body:**

```json
{
  "payment_method": "string", // Required - Payment method used
  "amount_paid": "number" // Optional - Amount paid (default: 49)
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Subscription renewed successfully",
  "new_end_date": "2027-07-20T00:00:00.000Z"
}
```

**Error Responses:**

- `400` - Missing payment method or invalid amount
- `404` - Business not found
- `500` - Server error

---

### 9. Cancel Subscription

**Endpoint:** `POST /business/petpro/cancel/:business_id`

**Description:** Cancel an active subscription.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Request Body:**

```json
{
  "reason": "string" // Optional - Reason for cancellation
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

**Error Responses:**

- `400` - No active subscription to cancel
- `404` - Business not found
- `500` - Server error

---

### 10. Upgrade Subscription

**Endpoint:** `POST /business/petpro/upgrade/:business_id`

**Description:** Upgrade or change the subscription type.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Request Body:**

```json
{
  "new_subscription_type": "string", // Required - "premium" or "basic"
  "payment_method": "string", // Required - Payment method used
  "amount_paid": "number" // Required - Amount paid for upgrade
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Subscription upgraded successfully",
  "data": {
    "subscription": {
      "is_active": true,
      "subscription_type": "premium",
      "start_date": "2025-07-20T00:00:00.000Z",
      "end_date": "2026-07-20T00:00:00.000Z",
      "payment_status": "paid",
      "amount_paid": 79,
      "payment_method": "credit_card"
    },
    "features": {
      "can_create_featured_ads": true,
      "max_featured_ads": 10,
      "can_showcase_products": true,
      "max_products": 100,
      "can_create_promotions": true,
      "max_promotions": 20,
      "analytics_access": true
    }
  }
}
```

**Error Responses:**

- `400` - Missing required fields or invalid subscription type
- `400` - No active subscription to upgrade
- `404` - Business not found
- `500` - Server error

---

### 11. Expire Subscriptions (Manual)

**Endpoint:** `POST /business/petpro/expire-subscriptions`

**Description:** Manually trigger the expiration check for all subscriptions (primarily for testing purposes).

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "Subscription expiration check completed",
  "data": {
    "success": true,
    "expired_count": 5,
    "expired_business_ids": ["id1", "id2", "id3", "id4", "id5"]
  }
}
```

**Error Responses:**

- `500` - Server error

---

## Error Responses

All endpoints may return the following error response format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (in development mode)"
}
```

### Common HTTP Status Codes:

- `200` - Success
- `400` - Bad Request (validation errors, missing required fields)
- `404` - Not Found (business/user not found)
- `500` - Internal Server Error

---

## Data Types Reference

### Subscription Types

- `"basic"` - Basic subscription with limited features
- `"premium"` - Premium subscription with full features

### Payment Status

- `"pending"` - Payment is pending
- `"paid"` - Payment completed successfully
- `"expired"` - Subscription has expired
- `"cancelled"` - Subscription was cancelled

### Business Features Object

```typescript
{
  can_create_featured_ads: boolean,
  max_featured_ads: number,
  can_showcase_products: boolean,
  max_products: number,
  can_create_promotions: boolean,
  max_promotions: number,
  analytics_access: boolean
}
```

### Statistics Object

```typescript
{
  total_views: number,
  total_clicks: number,
  monthly_views: number,
  monthly_clicks: number,
  last_stats_update: Date
}
```

---

## Usage Examples

### Frontend JavaScript Examples

#### 1. Register a new business:

```javascript
const registerBusiness = async (businessData) => {
  try {
    const response = await fetch("/business/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: "user_id_here",
        name: "Pet Paradise Store",
        type: "Pet Store",
        description: "Your one-stop shop for all pet needs",
        phone: "+1234567890",
        email: "info@petparadise.com",
        address: "123 Pet Street, Animal City",
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Business registered:", result.business);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 2. Activate PetPro subscription:

```javascript
const activateSubscription = async (businessId) => {
  try {
    const response = await fetch("/business/petpro/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        business_id: businessId,
        subscription_type: "premium",
        payment_method: "credit_card",
        amount_paid: 49,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Subscription activated:", result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 3. Check subscription status:

```javascript
const checkSubscription = async (businessId) => {
  try {
    const response = await fetch(`/business/petpro/status/${businessId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (result.success) {
      console.log("Subscription status:", result.data);
      console.log("Is expired:", result.data.is_expired);
      console.log("Features:", result.data.features);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 4. Upload business image:

```javascript
const uploadBusinessImage = async (businessId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("uid", businessId);
    formData.append("picture", imageFile);

    const response = await fetch("/business/image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      console.log("Image uploaded successfully");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

---

## Notes for Frontend Developers

1. **File Uploads**: For image uploads, use `FormData` and set the `Content-Type` to `multipart/form-data`.

2. **Date Handling**: All dates are returned in ISO 8601 format. Use `new Date()` constructor to parse them.

3. **Subscription Features**: The features object determines what actions a business can perform. Always check these before showing UI elements.

4. **Error Handling**: Always check the `success` property in responses. Error messages are localized and can be displayed to users.

5. **Subscription Expiry**: The system automatically expires subscriptions via a cron job. The `is_expired` field in the status response indicates if a subscription has expired.

6. **Validation**: Frontend should implement the same validation rules as described in the error responses to provide immediate feedback to users.

7. **Rate Limiting**: Consider implementing proper rate limiting on the frontend to avoid overwhelming the server.

---

This documentation covers all the business-related API endpoints. For questions or additional features, please contact the development team.
