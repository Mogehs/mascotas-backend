# Ads API Documentation

This document provides comprehensive documentation for all ads-related API endpoints in the Mascotas Backend.

## Base URL

```
/ads
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Ad Management](#ad-management)
2. [Ad Discovery](#ad-discovery)
3. [Featured Ads](#featured-ads)
4. [Analytics & Tracking](#analytics--tracking)
5. [Error Responses](#error-responses)

---

## Ad Management

### 1. Create Ad

**Endpoint:** `POST /ads/ad-register`

**Description:** Create a new advertisement for a business. Supports multiple images and advanced targeting options.

**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "id": "string", // Required - User ID (MongoDB ObjectId)
  "business_id": "string", // Required - Business ID (MongoDB ObjectId)
  "content": "string", // Required - Ad content/description
  "title": "string", // Optional - Ad title (auto-generated from content if not provided)
  "description": "string", // Optional - Additional description
  "category": "string", // Required - Ad category (see enum below)
  "method": "string", // Required - Payment method
  "name": "string", // Required - Billing name
  "address": "string", // Required - Billing address
  "is_featured": "boolean", // Optional - Whether ad should be featured (default: false)
  "target_audience": "object", // Optional - Targeting options
  "schedule": "object", // Optional - Scheduling options
  "picture": "file", // Required - Main ad image
  "additionalImages": "file[]" // Optional - Additional images
}
```

**Category Enum Values:**

- `"food"` - Pet food related ads
- `"accessories"` - Pet accessories
- `"toys"` - Pet toys
- `"health"` - Health products/services
- `"grooming"` - Grooming services
- `"services"` - Other pet services
- `"other"` - Other categories

**Target Audience Object:**

```json
{
  "age_range": {
    "min": "number", // Minimum age
    "max": "number" // Maximum age
  },
  "pet_types": ["string"], // Array of pet types (e.g., ["dog", "cat"])
  "location_radius": "number" // Targeting radius in km
}
```

**Schedule Object:**

```json
{
  "start_date": "string", // Start date (ISO 8601)
  "end_date": "string", // End date (ISO 8601)
  "time_slots": [
    {
      "day": "string", // Day of week (monday, tuesday, etc.)
      "start_time": "string", // Start time (HH:MM format)
      "end_time": "string" // End time (HH:MM format)
    }
  ]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Ad has been saved successfully",
  "data": {
    "_id": "ad_id",
    "id": "user_id",
    "business_id": "business_id",
    "content": "Premium pet food now available! Best nutrition for your furry friends.",
    "title": "Premium pet food now available! Best nutrition",
    "description": "High-quality ingredients, veterinarian approved.",
    "images": [
      "https://cloudinary.com/main_image.jpg",
      "https://cloudinary.com/additional_image1.jpg"
    ],
    "add_link": "https://cloudinary.com/main_image.jpg",
    "category": "food",
    "target_audience": {
      "age_range": {
        "min": 25,
        "max": 55
      },
      "pet_types": ["dog", "cat"],
      "location_radius": 25
    },
    "is_featured": true,
    "featured_until": "2025-08-20T10:00:00.000Z",
    "priority": 5,
    "status": "active",
    "budget": {
      "daily_limit": 50,
      "total_budget": 500,
      "spent": 0
    },
    "performance": {
      "views": 0,
      "clicks": 0,
      "conversions": 0,
      "ctr": 0
    },
    "schedule": {
      "start_date": "2025-07-20T00:00:00.000Z",
      "end_date": "2025-08-20T23:59:59.000Z",
      "time_slots": [
        {
          "day": "monday",
          "start_time": "09:00",
          "end_time": "18:00"
        }
      ]
    },
    "payment_method": "credit_card",
    "billing_name": "John Doe",
    "billing_address": "123 Business St, City",
    "createdAt": "2025-07-20T10:00:00.000Z",
    "updatedAt": "2025-07-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `400` - Missing ad image
- `403` - Business doesn't have featured ads permission (for featured ads)
- `403` - Featured ads limit reached
- `500` - Server error

---

### 2. Get All Ads

**Endpoint:** `GET /ads/`

**Description:** Get all active ads with filtering, pagination, and intelligent sorting (featured ads first).

**Query Parameters:**

```
page=1                    // Optional - Page number (default: 1)
limit=20                  // Optional - Items per page (default: 20)
category=food             // Optional - Filter by category
location=Madrid           // Optional - Filter by location (future feature)
featured_only=true        // Optional - Show only featured ads
business_id=business_id   // Optional - Filter by specific business
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Ads fetched successfully",
  "data": {
    "docs": [
      {
        "_id": "ad_id",
        "business_id": {
          "_id": "business_id",
          "company_name": "Pet Store Plus",
          "company_logo": "https://cloudinary.com/logo.jpg",
          "physical_address": "123 Pet Street, Animal City",
          "phone": "+1234567890"
        },
        "content": "Premium pet food now available!",
        "title": "Premium pet food now available!",
        "description": "High-quality ingredients, veterinarian approved.",
        "images": [
          "https://cloudinary.com/main_image.jpg",
          "https://cloudinary.com/additional_image1.jpg"
        ],
        "add_link": "https://cloudinary.com/main_image.jpg",
        "category": "food",
        "target_audience": {
          "age_range": {
            "min": 25,
            "max": 55
          },
          "pet_types": ["dog", "cat"],
          "location_radius": 25
        },
        "is_featured": true,
        "featured_until": "2025-08-20T10:00:00.000Z",
        "priority": 5,
        "status": "active",
        "performance": {
          "views": 1250,
          "clicks": 89,
          "conversions": 12,
          "ctr": 7.12
        },
        "schedule": {
          "start_date": "2025-07-20T00:00:00.000Z",
          "end_date": "2025-08-20T23:59:59.000Z"
        },
        "createdAt": "2025-07-20T10:00:00.000Z"
      }
    ],
    "totalDocs": 150,
    "limit": 20,
    "page": 1,
    "totalPages": 8,
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

### 3. Get Single Ad

**Endpoint:** `GET /ads/:ad_id`

**Description:** Get detailed information about a specific ad. Automatically tracks view analytics.

**URL Parameters:**

- `ad_id` (string, required) - The ad ID

**Query Parameters:**

```
user_id=user_id_here      // Optional - User ID for analytics tracking
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "ad_id",
    "business_id": {
      "_id": "business_id",
      "company_name": "Pet Store Plus",
      "company_logo": "https://cloudinary.com/logo.jpg",
      "physical_address": "123 Pet Street, Animal City",
      "phone": "+1234567890",
      "email": "info@petstoreplus.com"
    },
    "content": "Premium pet food now available! Best nutrition for your furry friends with high-quality ingredients.",
    "title": "Premium pet food now available!",
    "description": "High-quality ingredients, veterinarian approved. Perfect for dogs and cats of all ages.",
    "images": [
      "https://cloudinary.com/main_image.jpg",
      "https://cloudinary.com/additional_image1.jpg",
      "https://cloudinary.com/additional_image2.jpg"
    ],
    "add_link": "https://cloudinary.com/main_image.jpg",
    "category": "food",
    "target_audience": {
      "age_range": {
        "min": 25,
        "max": 55
      },
      "pet_types": ["dog", "cat"],
      "location_radius": 25
    },
    "is_featured": true,
    "featured_until": "2025-08-20T10:00:00.000Z",
    "priority": 5,
    "status": "active",
    "budget": {
      "daily_limit": 50,
      "total_budget": 500,
      "spent": 127.5
    },
    "performance": {
      "views": 1251,
      "clicks": 89,
      "conversions": 12,
      "ctr": 7.11
    },
    "schedule": {
      "start_date": "2025-07-20T00:00:00.000Z",
      "end_date": "2025-08-20T23:59:59.000Z",
      "time_slots": [
        {
          "day": "monday",
          "start_time": "09:00",
          "end_time": "18:00"
        },
        {
          "day": "tuesday",
          "start_time": "09:00",
          "end_time": "18:00"
        }
      ]
    },
    "payment_method": "credit_card",
    "billing_name": "John Doe",
    "billing_address": "123 Business St, City",
    "createdAt": "2025-07-20T10:00:00.000Z",
    "updatedAt": "2025-07-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `404` - Ad not found
- `500` - Server error

---

### 4. Update Ad

**Endpoint:** `PUT /ads/:ad_id`

**Description:** Update an existing ad. Supports partial updates and image replacement.

**URL Parameters:**

- `ad_id` (string, required) - The ad ID

**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "content": "string", // Optional - Updated content
  "title": "string", // Optional - Updated title
  "description": "string", // Optional - Updated description
  "category": "string", // Optional - Updated category
  "target_audience": "object", // Optional - Updated targeting
  "schedule": "object", // Optional - Updated schedule
  "picture": "file" // Optional - New main image
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Ad updated successfully",
  "data": {
    "_id": "ad_id",
    "business_id": {
      "_id": "business_id",
      "company_name": "Pet Store Plus"
    },
    "content": "Updated premium pet food content...",
    "title": "Updated Premium Pet Food Sale",
    // ... other updated fields
    "updatedAt": "2025-07-20T11:00:00.000Z"
  }
}
```

**Error Responses:**

- `404` - Ad not found
- `500` - Server error

---

### 5. Toggle Ad Status

**Endpoint:** `POST /ads/:ad_id/toggle-status`

**Description:** Pause or resume an ad.

**URL Parameters:**

- `ad_id` (string, required) - The ad ID

**Request Body:**

```json
{
  "action": "string" // Required - "pause" or "resume"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Ad paused successfully",
  "data": {
    "_id": "ad_id",
    "status": "paused",
    // ... other fields
    "updatedAt": "2025-07-20T11:00:00.000Z"
  }
}
```

**Error Responses:**

- `404` - Ad not found
- `500` - Server error

---

## Featured Ads

### 6. Make Ad Featured

**Endpoint:** `POST /ads/:ad_id/feature`

**Description:** Make an existing ad featured for a specified duration. Requires PetPro subscription.

**URL Parameters:**

- `ad_id` (string, required) - The ad ID

**Request Body:**

```json
{
  "duration_days": "number" // Optional - Duration in days (default: 30)
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Ad is now featured",
  "featured_until": "2025-08-20T10:00:00.000Z"
}
```

**Error Responses:**

- `404` - Ad not found
- `403` - Business doesn't have featured ads permission
- `500` - Server error

---

## Analytics & Tracking

### 7. Track Ad Click

**Endpoint:** `POST /ads/:ad_id/click`

**Description:** Track when a user clicks on an ad. Automatically calculates and updates CTR.

**URL Parameters:**

- `ad_id` (string, required) - The ad ID

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

- `404` - Ad not found
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
- `400` - Bad Request (missing image, validation errors)
- `403` - Forbidden (permission denied, limits reached)
- `404` - Not Found (ad/business not found)
- `500` - Internal Server Error

---

## Data Types Reference

### Ad Object

```typescript
{
  _id: string,
  id: string, // User ID
  business_id: string | BusinessObject,
  content: string,
  title: string,
  description?: string,
  images: string[],
  add_link: string,
  category: "food" | "accessories" | "toys" | "health" | "grooming" | "services" | "other",
  target_audience?: {
    age_range?: {
      min: number,
      max: number
    },
    pet_types?: string[],
    location_radius?: number
  },
  is_featured: boolean,
  featured_until?: Date,
  priority: number,
  status: "active" | "paused" | "expired" | "rejected",
  budget?: {
    daily_limit?: number,
    total_budget?: number,
    spent: number
  },
  performance: {
    views: number,
    clicks: number,
    conversions: number,
    ctr: number
  },
  schedule: {
    start_date: Date,
    end_date?: Date,
    time_slots?: Array<{
      day: string,
      start_time: string,
      end_time: string
    }>
  },
  payment_method: string,
  billing_name: string,
  billing_address: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Featured Ad Limits by Subscription:

- **Basic PetPro**: 3 featured ads maximum
- **Premium PetPro**: 10 featured ads maximum
- **No Subscription**: Cannot create featured ads

---

## Usage Examples

### Frontend JavaScript Examples

#### 1. Create a new ad:

```javascript
const createAd = async (adData, mainImage, additionalImages = []) => {
  try {
    const formData = new FormData();

    // Add ad data
    Object.keys(adData).forEach((key) => {
      if (typeof adData[key] === "object" && adData[key] !== null) {
        formData.append(key, JSON.stringify(adData[key]));
      } else {
        formData.append(key, adData[key]);
      }
    });

    // Add main image
    formData.append("picture", mainImage);

    // Add additional images
    additionalImages.forEach((image) => {
      formData.append("additionalImages", image);
    });

    const response = await fetch("/ads/ad-register", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      console.log("Ad created:", result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Usage
createAd(
  {
    id: "user_id_here",
    business_id: "business_id_here",
    content:
      "Premium pet food now available! Best nutrition for your furry friends.",
    title: "Premium Pet Food Sale",
    description: "High-quality ingredients, veterinarian approved.",
    category: "food",
    method: "credit_card",
    name: "John Doe",
    address: "123 Business St, City",
    is_featured: true,
    target_audience: {
      age_range: { min: 25, max: 55 },
      pet_types: ["dog", "cat"],
      location_radius: 25,
    },
    schedule: {
      start_date: "2025-07-20T00:00:00.000Z",
      end_date: "2025-08-20T23:59:59.000Z",
      time_slots: [
        {
          day: "monday",
          start_time: "09:00",
          end_time: "18:00",
        },
      ],
    },
  },
  mainImageFile,
  additionalImageFiles
);
```

#### 2. Get ads with filtering:

```javascript
const getAds = async (filters = {}) => {
  try {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`/ads/?${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (result.success) {
      console.log("Ads fetched:", result.data);
      console.log(`Found ${result.data.totalDocs} ads`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Usage
getAds({
  category: "food",
  featured_only: "true",
  page: 1,
  limit: 20,
});
```

#### 3. Track ad interaction:

```javascript
const trackAdView = async (adId, userId = null) => {
  try {
    const queryString = userId ? `?user_id=${userId}` : "";
    const response = await fetch(`/ads/${adId}${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (result.success) {
      console.log("Ad view tracked:", result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const trackAdClick = async (adId, userId = null) => {
  try {
    const response = await fetch(`/ads/${adId}/click`, {
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
      console.log("Ad click tracked successfully");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 4. Make ad featured:

```javascript
const makeAdFeatured = async (adId, durationDays = 30) => {
  try {
    const response = await fetch(`/ads/${adId}/feature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        duration_days: durationDays,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Ad is now featured until:", result.featured_until);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 5. Toggle ad status:

```javascript
const pauseAd = async (adId) => {
  try {
    const response = await fetch(`/ads/${adId}/toggle-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "pause",
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Ad paused successfully");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const resumeAd = async (adId) => {
  try {
    const response = await fetch(`/ads/${adId}/toggle-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "resume",
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Ad resumed successfully");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 6. React hook for ad management:

```javascript
import { useState, useCallback } from "react";

const useAdManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAd = useCallback(async (adData, mainImage, additionalImages) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      Object.keys(adData).forEach((key) => {
        if (typeof adData[key] === "object" && adData[key] !== null) {
          formData.append(key, JSON.stringify(adData[key]));
        } else {
          formData.append(key, adData[key]);
        }
      });

      formData.append("picture", mainImage);
      additionalImages.forEach((image) => {
        formData.append("additionalImages", image);
      });

      const response = await fetch("/ads/ad-register", {
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

  const getAds = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await fetch(`/ads/?${queryString}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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

  const trackAdClick = useCallback(async (adId, userId) => {
    try {
      const response = await fetch(`/ads/${adId}/click`, {
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
      console.error("Error tracking ad click:", err);
      return false;
    }
  }, []);

  return {
    createAd,
    getAds,
    trackAdClick,
    loading,
    error,
    setError,
  };
};

export default useAdManagement;
```

---

## Business Logic Notes

### Ad Prioritization:

- **Featured ads**: Priority 5, shown first
- **Regular ads**: Priority 1, shown after featured ads
- **Sorting**: Featured status → Priority → Creation date

### Image Handling:

- Main image is required for ad creation
- Additional images are optional (supports multiple)
- Images optimized to 1200x800 pixels
- Stored in Cloudinary under "mascotas/ads" folder

### Performance Tracking:

- **Views**: Automatic tracking when ad details are fetched
- **Clicks**: Manual tracking via click endpoint
- **CTR**: Automatically calculated as (clicks/views) \* 100
- **Conversions**: Manual tracking (requires custom implementation)

### Scheduling:

- Ads can have start and end dates
- Time slots allow specific hours per day
- Only active ads within schedule are shown

### Featured Ad System:

- Requires active PetPro subscription
- Featured duration customizable (default: 30 days)
- Automatically expires after featured_until date

### Targeting Options:

- Age range targeting
- Pet type targeting
- Location radius targeting (future feature)

---

## Notes for Frontend Developers

1. **Image Upload**: Always use FormData for ad creation with images.

2. **Featured Ads**: Check subscription status before allowing featured ad creation.

3. **Analytics**: Track both views and clicks for comprehensive ad performance.

4. **Status Management**: Implement pause/resume functionality for ad management.

5. **Scheduling**: Validate that end_date > start_date and time slots are logical.

6. **Performance Display**: Show CTR as a percentage with 2 decimal places.

7. **Categories**: Use consistent category enum across all pet-related features.

8. **Targeting**: Implement user-friendly targeting interfaces for better ad performance.

9. **Real-time Updates**: Consider websockets for live performance tracking.

10. **Budget Tracking**: Monitor ad spend if implementing budget features.

---

This documentation provides comprehensive guidance for integrating ad management functionality with support for featured ads, advanced targeting, performance tracking, and subscription-based limitations.
