# Analytics API Documentation

This document provides comprehensive documentation for all analytics-related API endpoints in the Mascotas Backend.

## Base URL

```
/analytics
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Business Analytics Overview](#business-analytics-overview)
2. [Performance Analytics](#performance-analytics)
3. [Geographic Analytics](#geographic-analytics)
4. [Quick Statistics](#quick-statistics)
5. [Admin Analytics](#admin-analytics)
6. [Error Responses](#error-responses)

---

## Business Analytics Overview

### 1. Get Business Analytics Overview

**Endpoint:** `GET /analytics/business/:business_id/overview`

**Description:** Get comprehensive analytics overview for a business including views, clicks, CTR, and performance breakdown. Requires PetPro subscription with analytics access.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Query Parameters:**

```
period=30d                // Optional - Time period (7d, 30d, 90d, 365d) (default: 30d)
start_date=2025-07-01     // Optional - Custom start date (ISO 8601)
end_date=2025-07-31       // Optional - Custom end date (ISO 8601)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_views": 5420,
      "total_clicks": 387,
      "monthly_views": 1250,
      "monthly_clicks": 89,
      "overall_ctr": "7.14",
      "monthly_ctr": "7.12",
      "last_stats_update": "2025-07-20T10:00:00.000Z",
      "period": "30d"
    },
    "performance": {
      "ads": {
        "views": 450,
        "clicks": 32,
        "ctr": "7.11"
      },
      "products": {
        "views": 680,
        "clicks": 45,
        "ctr": "6.62"
      },
      "promotions": {
        "views": 120,
        "clicks": 12,
        "ctr": "10.00"
      }
    },
    "daily_stats": [
      {
        "_id": {
          "date": "2025-07-19",
          "type": "product_view"
        },
        "count": 45
      },
      {
        "_id": {
          "date": "2025-07-19",
          "type": "product_click"
        },
        "count": 3
      },
      {
        "_id": {
          "date": "2025-07-20",
          "type": "ad_view"
        },
        "count": 25
      }
    ]
  }
}
```

**Error Responses:**

- `403` - Business doesn't have analytics access
- `500` - Server error

---

## Performance Analytics

### 2. Get Product Analytics

**Endpoint:** `GET /analytics/business/:business_id/products`

**Description:** Get detailed product performance analytics including top performing products with views, clicks, and CTR.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Query Parameters:**

```
period=30d                // Optional - Time period (7d, 30d, 90d, 365d) (default: 30d)
limit=10                  // Optional - Number of top products to return (default: 10)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "product": {
        "_id": "product_id_1",
        "name": "Premium Dog Food",
        "price": 29.99,
        "images": ["https://cloudinary.com/product_image.jpg"],
        "category": "food"
      },
      "analytics": {
        "views": 245,
        "clicks": 18,
        "ctr": "7.35"
      }
    },
    {
      "product": {
        "_id": "product_id_2",
        "name": "Interactive Dog Toy",
        "price": 15.99,
        "images": ["https://cloudinary.com/toy_image.jpg"],
        "category": "toys"
      },
      "analytics": {
        "views": 189,
        "clicks": 12,
        "ctr": "6.35"
      }
    }
  ]
}
```

**Error Responses:**

- `403` - Business doesn't have analytics access
- `500` - Server error

---

### 3. Get Promotion Analytics

**Endpoint:** `GET /analytics/business/:business_id/promotions`

**Description:** Get detailed promotion performance analytics including views, clicks, conversions, and usage statistics.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Query Parameters:**

```
period=30d                // Optional - Time period (7d, 30d, 90d, 365d) (default: 30d)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "promotion": {
        "id": "promotion_id_1",
        "title": "Summer Pet Food Sale",
        "type": "percentage",
        "value": 20,
        "is_active": true
      },
      "analytics": {
        "views": 156,
        "clicks": 23,
        "conversions": 8,
        "usage_count": 8,
        "ctr": "14.74",
        "conversion_rate": "34.78"
      }
    },
    {
      "promotion": {
        "id": "promotion_id_2",
        "title": "Free Shipping Weekend",
        "type": "free_shipping",
        "value": 0,
        "is_active": false
      },
      "analytics": {
        "views": 89,
        "clicks": 12,
        "conversions": 5,
        "usage_count": 5,
        "ctr": "13.48",
        "conversion_rate": "41.67"
      }
    }
  ]
}
```

**Error Responses:**

- `403` - Business doesn't have analytics access
- `500` - Server error

---

### 4. Get Ad Analytics

**Endpoint:** `GET /analytics/business/:business_id/ads`

**Description:** Get detailed ad performance analytics including views, clicks, and CTR for all ads.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Query Parameters:**

```
period=30d                // Optional - Time period (7d, 30d, 90d, 365d) (default: 30d)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "ad": {
        "_id": "ad_id_1",
        "title": "Premium Pet Food Sale",
        "content": "Get the best nutrition for your pets with our premium food collection...",
        "category": "food",
        "is_featured": true,
        "status": "active"
      },
      "analytics": {
        "views": 134,
        "clicks": 12,
        "ctr": "8.96"
      }
    },
    {
      "ad": {
        "_id": "ad_id_2",
        "title": "Professional Pet Grooming",
        "content": "Expert grooming services for all breeds...",
        "category": "grooming",
        "is_featured": false,
        "status": "active"
      },
      "analytics": {
        "views": 98,
        "clicks": 6,
        "ctr": "6.12"
      }
    }
  ]
}
```

**Error Responses:**

- `403` - Business doesn't have analytics access
- `500` - Server error

---

## Geographic Analytics

### 5. Get Geographic Analytics

**Endpoint:** `GET /analytics/business/:business_id/geographic`

**Description:** Get geographic distribution of views and clicks by city and country.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Query Parameters:**

```
period=30d                // Optional - Time period (7d, 30d, 90d, 365d) (default: 30d)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": {
        "city": "Madrid",
        "country": "Spain"
      },
      "views": 234,
      "clicks": 18
    },
    {
      "_id": {
        "city": "Barcelona",
        "country": "Spain"
      },
      "views": 189,
      "clicks": 14
    },
    {
      "_id": {
        "city": "Valencia",
        "country": "Spain"
      },
      "views": 156,
      "clicks": 12
    },
    {
      "_id": {
        "city": "Seville",
        "country": "Spain"
      },
      "views": 123,
      "clicks": 9
    }
  ]
}
```

**Error Responses:**

- `403` - Business doesn't have analytics access
- `500` - Server error

---

## Quick Statistics

### 6. Get Quick Business Stats

**Endpoint:** `GET /analytics/business/:business_id/quick-stats`

**Description:** Get cached quick statistics for fast dashboard loading. Returns pre-calculated values updated by cron jobs.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "total_views": 5420,
    "total_clicks": 387,
    "monthly_views": 1250,
    "monthly_clicks": 89,
    "overall_ctr": "7.14",
    "monthly_ctr": "7.12",
    "last_stats_update": "2025-07-20T10:00:00.000Z"
  },
  "message": "Quick statistics retrieved from cached data"
}
```

**Error Responses:**

- `403` - Business doesn't have analytics access
- `500` - Server error

---

### 7. Update Business Statistics

**Endpoint:** `POST /analytics/update-statistics`

**Description:** Manually trigger statistics update for all businesses. Typically used by cron jobs but available for manual execution.

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "Updated statistics for 45 businesses"
}
```

**Error Responses:**

- `500` - Server error

---

## Admin Analytics

### 8. Get Admin Analytics Overview

**Endpoint:** `GET /analytics/admin/overview`

**Description:** Get system-wide analytics overview for administrators including QR codes, users, and pets statistics.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalQR": 15000,
    "assignedQR": 8500,
    "notAssignedQR": 6500,
    "totalUsers": 12000,
    "totalPets": 9500
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
- `403` - Forbidden (no analytics access)
- `500` - Internal Server Error

---

## Data Types Reference

### Analytics Types

```typescript
type AnalyticsType =
  | "ad_view"
  | "ad_click"
  | "product_view"
  | "product_click"
  | "product_contact"
  | "promotion_view"
  | "promotion_click"
  | "profile_view";
```

### Resource Types

```typescript
type ResourceType = "ad" | "product" | "promotion" | "business_profile";
```

### Time Periods

```typescript
type Period = "7d" | "30d" | "90d" | "365d";
```

### Analytics Object Structure

```typescript
{
  business_id: string,
  date: Date,
  type: AnalyticsType,
  resource_id: string,
  resource_type: ResourceType,
  user_id?: string,
  user_location?: {
    city?: string,
    country?: string,
    coordinates?: {
      latitude: number,
      longitude: number
    }
  },
  device_info?: string,
  session_id?: string,
  referrer?: string,
  metadata?: Record<string, any>
}
```

---

## Usage Examples

### Frontend JavaScript Examples

#### 1. Get business analytics overview:

```javascript
const getBusinessAnalytics = async (businessId, period = "30d") => {
  try {
    const response = await fetch(
      `/analytics/business/${businessId}/overview?period=${period}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Business analytics:", result.data);

      // Access overview data
      const { overview, performance, daily_stats } = result.data;
      console.log(`Total views: ${overview.total_views}`);
      console.log(`Overall CTR: ${overview.overall_ctr}%`);

      // Access performance breakdown
      console.log("Ad performance:", performance.ads);
      console.log("Product performance:", performance.products);
      console.log("Promotion performance:", performance.promotions);

      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 2. Get product analytics:

```javascript
const getProductAnalytics = async (businessId, period = "30d", limit = 10) => {
  try {
    const response = await fetch(
      `/analytics/business/${businessId}/products?period=${period}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Product analytics:", result.data);

      // Process top performing products
      result.data.forEach((item, index) => {
        console.log(`#${index + 1} Product: ${item.product.name}`);
        console.log(
          `Views: ${item.analytics.views}, CTR: ${item.analytics.ctr}%`
        );
      });

      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 3. Get promotion analytics:

```javascript
const getPromotionAnalytics = async (businessId, period = "30d") => {
  try {
    const response = await fetch(
      `/analytics/business/${businessId}/promotions?period=${period}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Promotion analytics:", result.data);

      // Process promotion performance
      result.data.forEach((item) => {
        console.log(`Promotion: ${item.promotion.title}`);
        console.log(
          `CTR: ${item.analytics.ctr}%, Conversion Rate: ${item.analytics.conversion_rate}%`
        );
        console.log(
          `Conversions: ${item.analytics.conversions}/${item.analytics.clicks} clicks`
        );
      });

      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 4. Get geographic analytics:

```javascript
const getGeographicAnalytics = async (businessId, period = "30d") => {
  try {
    const response = await fetch(
      `/analytics/business/${businessId}/geographic?period=${period}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Geographic analytics:", result.data);

      // Process geographic data
      result.data.forEach((location, index) => {
        console.log(
          `#${index + 1} ${location._id.city}, ${location._id.country}`
        );
        console.log(`Views: ${location.views}, Clicks: ${location.clicks}`);
      });

      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 5. Get quick stats for dashboard:

```javascript
const getQuickStats = async (businessId) => {
  try {
    const response = await fetch(
      `/analytics/business/${businessId}/quick-stats`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Quick stats:", result.data);

      // Use for dashboard widgets
      const stats = result.data;
      updateDashboardWidget("total-views", stats.total_views);
      updateDashboardWidget("total-clicks", stats.total_clicks);
      updateDashboardWidget("overall-ctr", `${stats.overall_ctr}%`);
      updateDashboardWidget("monthly-ctr", `${stats.monthly_ctr}%`);

      return result.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 6. React hook for analytics:

```javascript
import { useState, useEffect, useCallback } from "react";

const useBusinessAnalytics = (businessId) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(
    async (period = "30d") => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/analytics/business/${businessId}/overview?period=${period}`,
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

        setAnalytics(result.data);
        return result.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [businessId]
  );

  const fetchProductAnalytics = useCallback(
    async (period = "30d", limit = 10) => {
      try {
        const response = await fetch(
          `/analytics/business/${businessId}/products?period=${period}&limit=${limit}`,
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
      }
    },
    [businessId]
  );

  const fetchPromotionAnalytics = useCallback(
    async (period = "30d") => {
      try {
        const response = await fetch(
          `/analytics/business/${businessId}/promotions?period=${period}`,
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
      }
    },
    [businessId]
  );

  const fetchQuickStats = useCallback(async () => {
    try {
      const response = await fetch(
        `/analytics/business/${businessId}/quick-stats`,
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
    }
  }, [businessId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (businessId) {
      fetchAnalytics();
    }
  }, [businessId, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    fetchProductAnalytics,
    fetchPromotionAnalytics,
    fetchQuickStats,
    setError,
  };
};

export default useBusinessAnalytics;
```

#### 7. Analytics dashboard component example:

```javascript
const AnalyticsDashboard = ({ businessId }) => {
  const {
    analytics,
    loading,
    error,
    fetchProductAnalytics,
    fetchPromotionAnalytics,
    fetchQuickStats,
  } = useBusinessAnalytics(businessId);

  const [period, setPeriod] = useState("30d");
  const [productData, setProductData] = useState([]);
  const [promotionData, setPromotionData] = useState([]);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const [products, promotions] = await Promise.all([
          fetchProductAnalytics(period, 5),
          fetchPromotionAnalytics(period),
        ]);

        setProductData(products);
        setPromotionData(promotions);
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    };

    if (businessId) {
      loadAnalyticsData();
    }
  }, [businessId, period, fetchProductAnalytics, fetchPromotionAnalytics]);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analytics) return <div>No analytics data available</div>;

  return (
    <div className="analytics-dashboard">
      <div className="period-selector">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="365d">Last year</option>
        </select>
      </div>

      <div className="overview-cards">
        <div className="stat-card">
          <h3>Total Views</h3>
          <p>{analytics.overview.total_views.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Clicks</h3>
          <p>{analytics.overview.total_clicks.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Overall CTR</h3>
          <p>{analytics.overview.overall_ctr}%</p>
        </div>
        <div className="stat-card">
          <h3>Monthly CTR</h3>
          <p>{analytics.overview.monthly_ctr}%</p>
        </div>
      </div>

      <div className="performance-breakdown">
        <div className="section">
          <h3>Performance by Type</h3>
          <div className="performance-grid">
            <div className="performance-item">
              <h4>Ads</h4>
              <p>Views: {analytics.performance.ads.views}</p>
              <p>Clicks: {analytics.performance.ads.clicks}</p>
              <p>CTR: {analytics.performance.ads.ctr}%</p>
            </div>
            <div className="performance-item">
              <h4>Products</h4>
              <p>Views: {analytics.performance.products.views}</p>
              <p>Clicks: {analytics.performance.products.clicks}</p>
              <p>CTR: {analytics.performance.products.ctr}%</p>
            </div>
            <div className="performance-item">
              <h4>Promotions</h4>
              <p>Views: {analytics.performance.promotions.views}</p>
              <p>Clicks: {analytics.performance.promotions.clicks}</p>
              <p>CTR: {analytics.performance.promotions.ctr}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="top-performers">
        <div className="section">
          <h3>Top Performing Products</h3>
          <ul>
            {productData.map((item, index) => (
              <li key={item.product._id}>
                #{index + 1} {item.product.name} - {item.analytics.views} views,{" "}
                {item.analytics.ctr}% CTR
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
```

---

## Business Logic Notes

### Analytics Access:

- Requires active PetPro subscription with analytics_access feature
- All analytics endpoints check subscription status before returning data

### Data Aggregation:

- **Overview**: Uses cached statistics for fast loading
- **Detailed Analytics**: Real-time aggregation from Analytics collection
- **Quick Stats**: Pre-calculated cached values updated by cron jobs

### Time Periods:

- **7d**: Last 7 days
- **30d**: Last 30 days (default)
- **90d**: Last 90 days
- **365d**: Last year
- **Custom**: Use start_date and end_date parameters

### CTR Calculation:

- CTR = (Clicks / Views) × 100
- Displayed with 2 decimal places
- Calculated in real-time for detailed analytics

### Geographic Data:

- Based on user location when available
- Limited to top 20 locations by views
- Requires user_location data in analytics records

### Caching Strategy:

- Business statistics cached in Business model
- Updated regularly by cron jobs
- Quick stats endpoint uses cached data for performance

---

## Notes for Frontend Developers

1. **Subscription Requirement**: Always check if business has analytics access before showing analytics UI.

2. **Performance**: Use quick-stats endpoint for dashboard widgets and overview for detailed analytics.

3. **Time Periods**: Implement period selector with standard options (7d, 30d, 90d, 365d).

4. **Error Handling**: Handle 403 errors gracefully with upgrade prompts.

5. **Data Visualization**: Consider using charts libraries (Chart.js, D3.js) for visual analytics.

6. **Real-time Updates**: Quick stats are cached; detailed analytics are real-time.

7. **Geographic Display**: Use maps libraries for geographic analytics visualization.

8. **CTR Interpretation**: Higher CTR indicates better engagement (industry average ~2-5%).

9. **Performance Optimization**: Cache analytics data on frontend with reasonable TTL.

10. **Admin Access**: Admin analytics endpoint requires admin privileges.

---

This documentation provides comprehensive guidance for integrating analytics functionality with subscription-based access control, performance optimization, and detailed business insights.
