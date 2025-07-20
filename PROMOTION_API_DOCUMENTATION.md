# Promotion API Documentation

This document provides comprehensive documentation for all promotion-related API endpoints in the Mascotas Backend.

## Base URL

```
/promotion
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Promotion Management](#promotion-management)
2. [Promotion Discovery](#promotion-discovery)
3. [Analytics & Tracking](#analytics--tracking)
4. [Error Responses](#error-responses)

---

## Promotion Management

### 1. Create Promotion

**Endpoint:** `POST /promotion/create`

**Description:** Create a new promotion for a business. Requires active PetPro subscription and respects promotion limits.

**Middleware:** `checkActiveSubscription`, `checkPromotionsPermission`

**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "business_id": "string", // Required - Business ID (MongoDB ObjectId)
  "title": "string", // Required - Promotion title
  "description": "string", // Required - Promotion description
  "type": "string", // Required - Promotion type (see enum below)
  "value": "number", // Required - Promotion value
  "minimum_order_amount": "number", // Optional - Minimum order amount (default: 0)
  "applicable_products": "array", // Optional - Array of product IDs
  "applicable_categories": "array", // Optional - Array of categories
  "start_date": "string", // Required - Start date (ISO 8601)
  "end_date": "string", // Required - End date (ISO 8601)
  "usage_limit": "number", // Optional - Usage limit (null for unlimited)
  "terms_conditions": "string", // Optional - Terms and conditions
  "banner_image": "file" // Optional - Banner image file
}
```

**Promotion Types:**

- `"percentage"` - Percentage discount (value represents percentage, e.g., 20 for 20%)
- `"fixed_amount"` - Fixed amount discount (value represents currency amount)
- `"buy_one_get_one"` - Buy one get one free (value typically 1)
- `"free_shipping"` - Free shipping (value typically 0)

**Categories (same as products):**

- `"food"`, `"accessories"`, `"toys"`, `"health"`, `"grooming"`, `"other"`

**Success Response (201):**

```json
{
  "success": true,
  "message": "Promotion created successfully",
  "data": {
    "_id": "promotion_id",
    "business_id": {
      "_id": "business_id",
      "company_name": "Pet Store Plus"
    },
    "title": "Summer Pet Food Sale",
    "description": "Get 20% off on all premium pet food during summer!",
    "type": "percentage",
    "value": 20,
    "minimum_order_amount": 25,
    "applicable_products": ["product_id_1", "product_id_2"],
    "applicable_categories": ["food"],
    "start_date": "2025-07-20T00:00:00.000Z",
    "end_date": "2025-08-20T23:59:59.000Z",
    "usage_limit": 100,
    "usage_count": 0,
    "is_active": true,
    "banner_image": "https://cloudinary.com/banner_image.jpg",
    "terms_conditions": "Valid on premium food items only. Cannot be combined with other offers.",
    "views": 0,
    "clicks": 0,
    "conversions": 0,
    "createdAt": "2025-07-20T10:00:00.000Z",
    "updatedAt": "2025-07-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `403` - Business doesn't have promotion permission
- `403` - Promotion limit reached for current subscription plan
- `400` - Invalid promotion data or dates
- `500` - Server error

---

### 2. Get Business Promotions

**Endpoint:** `GET /promotion/business/:business_id`

**Description:** Get all promotions for a specific business with filtering and pagination.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Query Parameters:**

```
page=1                    // Optional - Page number (default: 1)
limit=10                  // Optional - Items per page (default: 10)
status=all                // Optional - Filter by status (default: all)
```

**Status Filter Options:**

- `"all"` - All promotions
- `"active"` - Currently active promotions
- `"expired"` - Expired promotions
- `"upcoming"` - Future promotions
- `"inactive"` - Deactivated promotions

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "_id": "promotion_id",
        "business_id": {
          "_id": "business_id",
          "company_name": "Pet Store Plus"
        },
        "title": "Summer Pet Food Sale",
        "description": "Get 20% off on all premium pet food during summer!",
        "type": "percentage",
        "value": 20,
        "minimum_order_amount": 25,
        "applicable_products": [
          {
            "_id": "product_id",
            "name": "Premium Dog Food",
            "price": 29.99,
            "images": ["https://cloudinary.com/product_image.jpg"]
          }
        ],
        "applicable_categories": ["food"],
        "start_date": "2025-07-20T00:00:00.000Z",
        "end_date": "2025-08-20T23:59:59.000Z",
        "usage_limit": 100,
        "usage_count": 15,
        "is_active": true,
        "banner_image": "https://cloudinary.com/banner_image.jpg",
        "terms_conditions": "Valid on premium food items only.",
        "views": 245,
        "clicks": 67,
        "conversions": 12,
        "createdAt": "2025-07-20T10:00:00.000Z",
        "updatedAt": "2025-07-20T10:00:00.000Z"
      }
    ],
    "totalDocs": 15,
    "limit": 10,
    "page": 1,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

**Error Responses:**

- `500` - Server error

---

### 3. Update Promotion

**Endpoint:** `PUT /promotion/:promotion_id`

**Description:** Update an existing promotion. Supports partial updates and banner image upload.

**URL Parameters:**

- `promotion_id` (string, required) - The promotion ID

**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "title": "string", // Optional - Updated title
  "description": "string", // Optional - Updated description
  "type": "string", // Optional - Updated type
  "value": "number", // Optional - Updated value
  "minimum_order_amount": "number", // Optional - Updated minimum order amount
  "applicable_products": "array", // Optional - Updated product IDs
  "applicable_categories": "array", // Optional - Updated categories
  "start_date": "string", // Optional - Updated start date
  "end_date": "string", // Optional - Updated end date
  "usage_limit": "number", // Optional - Updated usage limit
  "terms_conditions": "string", // Optional - Updated terms
  "banner_image": "file" // Optional - New banner image file
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Promotion updated successfully",
  "data": {
    "_id": "promotion_id",
    "business_id": {
      "_id": "business_id",
      "company_name": "Pet Store Plus"
    },
    "title": "Updated Summer Sale",
    "description": "Updated description...",
    "type": "percentage",
    "value": 25,
    // ... other fields
    "updatedAt": "2025-07-20T11:00:00.000Z"
  }
}
```

**Error Responses:**

- `404` - Promotion not found
- `400` - Invalid update data
- `500` - Server error

---

### 4. Delete Promotion

**Endpoint:** `DELETE /promotion/:promotion_id`

**Description:** Soft delete a promotion (marks as inactive rather than removing from database).

**URL Parameters:**

- `promotion_id` (string, required) - The promotion ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Promotion deactivated successfully"
}
```

**Error Responses:**

- `404` - Promotion not found
- `500` - Server error

---

## Promotion Discovery

### 5. Get Active Promotions

**Endpoint:** `GET /promotion/active`

**Description:** Get all currently active promotions across all businesses for customer discovery.

**Query Parameters:**

```
page=1                    // Optional - Page number (default: 1)
limit=20                  // Optional - Items per page (default: 20)
category=food             // Optional - Filter by category
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "_id": "promotion_id",
        "business_id": {
          "_id": "business_id",
          "company_name": "Pet Store Plus",
          "company_logo": "https://cloudinary.com/logo.jpg",
          "physical_address": "123 Pet Street, Animal City"
        },
        "title": "Summer Pet Food Sale",
        "description": "Get 20% off on all premium pet food during summer!",
        "type": "percentage",
        "value": 20,
        "minimum_order_amount": 25,
        "applicable_products": [
          {
            "_id": "product_id",
            "name": "Premium Dog Food",
            "price": 29.99,
            "images": ["https://cloudinary.com/product_image.jpg"]
          }
        ],
        "applicable_categories": ["food"],
        "start_date": "2025-07-20T00:00:00.000Z",
        "end_date": "2025-08-20T23:59:59.000Z",
        "usage_limit": 100,
        "usage_count": 15,
        "banner_image": "https://cloudinary.com/banner_image.jpg",
        "terms_conditions": "Valid on premium food items only.",
        "views": 245,
        "clicks": 67,
        "conversions": 12,
        "createdAt": "2025-07-20T10:00:00.000Z"
      }
    ],
    "totalDocs": 50,
    "limit": 20,
    "page": 1,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

**Error Responses:**

- `500` - Server error

---

### 6. Get Single Promotion

**Endpoint:** `GET /promotion/:promotion_id`

**Description:** Get detailed information about a specific promotion. Automatically tracks view analytics.

**URL Parameters:**

- `promotion_id` (string, required) - The promotion ID

**Query Parameters:**

```
user_id=user_id_here      // Optional - User ID for analytics tracking
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "promotion_id",
    "business_id": {
      "_id": "business_id",
      "company_name": "Pet Store Plus",
      "company_logo": "https://cloudinary.com/logo.jpg",
      "physical_address": "123 Pet Street, Animal City",
      "phone": "+1234567890",
      "email": "info@petstoreplus.com"
    },
    "title": "Summer Pet Food Sale",
    "description": "Get 20% off on all premium pet food during summer! Perfect time to stock up on your pet's favorite meals.",
    "type": "percentage",
    "value": 20,
    "minimum_order_amount": 25,
    "applicable_products": [
      {
        "_id": "product_id",
        "name": "Premium Dog Food",
        "price": 29.99,
        "images": ["https://cloudinary.com/product_image.jpg"]
      }
    ],
    "applicable_categories": ["food"],
    "start_date": "2025-07-20T00:00:00.000Z",
    "end_date": "2025-08-20T23:59:59.000Z",
    "usage_limit": 100,
    "usage_count": 16,
    "is_active": true,
    "banner_image": "https://cloudinary.com/banner_image.jpg",
    "terms_conditions": "Valid on premium food items only. Cannot be combined with other offers. Minimum order of €25 required.",
    "views": 246,
    "clicks": 67,
    "conversions": 12,
    "createdAt": "2025-07-20T10:00:00.000Z",
    "updatedAt": "2025-07-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `404` - Promotion not found
- `500` - Server error

---

## Analytics & Tracking

### 7. Track Promotion Click

**Endpoint:** `POST /promotion/:promotion_id/click`

**Description:** Track when a user clicks on a promotion (e.g., "Use Promotion" button).

**URL Parameters:**

- `promotion_id` (string, required) - The promotion ID

**Request Body:**

```json
{
  "user_id": "string" // Optional - User ID for analytics
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Click tracked successfully"
}
```

**Error Responses:**

- `404` - Promotion not found
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
- `201` - Created successfully
- `400` - Bad Request (validation errors)
- `403` - Forbidden (permission denied, limits reached)
- `404` - Not Found (promotion/business not found)
- `500` - Internal Server Error

---

## Data Types Reference

### Promotion Object

```typescript
{
  _id: string,
  business_id: string | BusinessObject,
  title: string,
  description: string,
  type: "percentage" | "fixed_amount" | "buy_one_get_one" | "free_shipping",
  value: number,
  minimum_order_amount: number,
  applicable_products: string[] | ProductObject[],
  applicable_categories: string[],
  start_date: Date,
  end_date: Date,
  usage_limit: number | null,
  usage_count: number,
  is_active: boolean,
  banner_image?: string,
  terms_conditions?: string,
  views: number,
  clicks: number,
  conversions: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Business Promotion Limits

- **Basic PetPro**: 5 active promotions maximum
- **Premium PetPro**: 20 active promotions maximum
- **No Subscription**: Cannot create promotions

---

## Usage Examples

### Frontend JavaScript Examples

#### 1. Create a new promotion:

```javascript
const createPromotion = async (promotionData, bannerImageFile) => {
  try {
    const formData = new FormData();

    // Add promotion data
    Object.keys(promotionData).forEach((key) => {
      if (Array.isArray(promotionData[key])) {
        promotionData[key].forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else {
        formData.append(key, promotionData[key]);
      }
    });

    // Add banner image if provided
    if (bannerImageFile) {
      formData.append("banner_image", bannerImageFile);
    }

    const response = await fetch("/promotion/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      console.log("Promotion created:", result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Usage
createPromotion(
  {
    business_id: "business_id_here",
    title: "Summer Pet Food Sale",
    description: "Get 20% off on all premium pet food during summer!",
    type: "percentage",
    value: 20,
    minimum_order_amount: 25,
    applicable_categories: ["food"],
    start_date: "2025-07-20T00:00:00.000Z",
    end_date: "2025-08-20T23:59:59.000Z",
    usage_limit: 100,
    terms_conditions: "Valid on premium food items only.",
  },
  bannerImageFile
);
```

#### 2. Get business promotions with filtering:

```javascript
const getBusinessPromotions = async (businessId, filters = {}) => {
  try {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(
      `/promotion/business/${businessId}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Business promotions:", result.data);
      console.log(`Found ${result.data.totalDocs} promotions`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Usage
getBusinessPromotions("business_id_here", {
  status: "active",
  page: 1,
  limit: 10,
});
```

#### 3. Get active promotions for customers:

```javascript
const getActivePromotions = async (filters = {}) => {
  try {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`/promotion/active?${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (result.success) {
      console.log("Active promotions:", result.data);
      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Usage
getActivePromotions({
  category: "food",
  page: 1,
  limit: 20,
});
```

#### 4. Track promotion interaction:

```javascript
const trackPromotionView = async (promotionId, userId = null) => {
  try {
    const queryString = userId ? `?user_id=${userId}` : "";
    const response = await fetch(`/promotion/${promotionId}${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (result.success) {
      console.log("Promotion view tracked:", result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const trackPromotionClick = async (promotionId, userId = null) => {
  try {
    const response = await fetch(`/promotion/${promotionId}/click`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Promotion click tracked successfully");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 5. Update promotion:

```javascript
const updatePromotion = async (
  promotionId,
  updateData,
  newBannerImage = null
) => {
  try {
    const formData = new FormData();

    // Add update data
    Object.keys(updateData).forEach((key) => {
      if (Array.isArray(updateData[key])) {
        updateData[key].forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else {
        formData.append(key, updateData[key]);
      }
    });

    // Add new banner image if provided
    if (newBannerImage) {
      formData.append("banner_image", newBannerImage);
    }

    const response = await fetch(`/promotion/${promotionId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      console.log("Promotion updated:", result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 6. React hook for promotion management:

```javascript
import { useState, useCallback } from "react";

const usePromotionManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPromotion = useCallback(async (promotionData, bannerImage) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      Object.keys(promotionData).forEach((key) => {
        if (Array.isArray(promotionData[key])) {
          promotionData[key].forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else {
          formData.append(key, promotionData[key]);
        }
      });

      if (bannerImage) {
        formData.append("banner_image", bannerImage);
      }

      const response = await fetch("/promotion/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBusinessPromotions = useCallback(
    async (businessId, filters = {}) => {
      setLoading(true);
      setError(null);

      try {
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(
          `/promotion/business/${businessId}?${queryString}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message);
        }

        return result.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const trackPromotionClick = useCallback(async (promotionId, userId) => {
    try {
      const response = await fetch(`/promotion/${promotionId}/click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error("Error tracking promotion click:", err);
      return false;
    }
  }, []);

  return {
    createPromotion,
    getBusinessPromotions,
    trackPromotionClick,
    loading,
    error,
    setError,
  };
};

export default usePromotionManagement;
```

---

## Business Logic Notes

### Promotion Types Explained:

1. **Percentage Discount (`percentage`)**

   - `value`: Percentage amount (e.g., 20 for 20% off)
   - Applied as: `original_price * (1 - value/100)`

2. **Fixed Amount Discount (`fixed_amount`)**

   - `value`: Currency amount to subtract (e.g., 5 for €5 off)
   - Applied as: `original_price - value`

3. **Buy One Get One (`buy_one_get_one`)**

   - `value`: Usually 1 (for BOGO)
   - Logic: For every X items, get Y free

4. **Free Shipping (`free_shipping`)**
   - `value`: Usually 0
   - Removes shipping costs from order

### Date Validation:

- `end_date` must be after `start_date`
- Promotions are automatically filtered by current date
- Use ISO 8601 format for dates

### Analytics Tracking:

- **Views**: Tracked when promotion details are fetched
- **Clicks**: Tracked when user interacts with promotion
- **Conversions**: Manual tracking when purchase is completed

### Image Handling:

- Banner images optimized to 1200x600 pixels
- Stored in Cloudinary under "petpro_promotions" folder
- Quality automatically optimized

### Subscription Requirements:

- Active PetPro subscription required for creation
- Promotion limits enforced by subscription type
- Middleware automatically validates permissions

---

## Notes for Frontend Developers

1. **Date Handling**: Always use ISO 8601 format for dates and validate that end_date > start_date.

2. **Image Upload**: Use FormData for promotion creation/updates with banner images.

3. **Analytics**: Track both views and clicks for better business insights.

4. **Validation**: Implement client-side validation for promotion types and values.

5. **Categories**: Use the same category enum as products for consistency.

6. **Pagination**: Implement proper pagination for promotion lists.

7. **Status Filtering**: Use status filters to show relevant promotions to users.

8. **Error Handling**: Handle subscription limit errors gracefully with upgrade prompts.

9. **Real-time Updates**: Consider implementing websockets for real-time promotion statistics.

10. **Caching**: Cache active promotions for better performance on customer-facing pages.

---

This documentation provides comprehensive guidance for integrating promotion management functionality into frontend applications with all the necessary business logic and examples.
