# Product API Documentation

This document provides comprehensive documentation for all product-related API endpoints in the Mascotas Backend.

## Base URL

```
/product
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Product Management](#product-management)
2. [Product Search & Discovery](#product-search--discovery)
3. [Featured Products](#featured-products)
4. [Analytics & Tracking](#analytics--tracking)
5. [Error Responses](#error-responses)

---

## Product Management

### 1. Create Product

**Endpoint:** `POST /product/create`

**Description:** Create a new product showcase for a business. Requires active PetPro subscription.

**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "business_id": "string", // Required - Business ID (MongoDB ObjectId)
  "name": "string", // Required - Product name
  "description": "string", // Required - Product description
  "category": "string", // Required - Product category (see enum below)
  "price": "number", // Required - Product price
  "availability_status": "string", // Optional - Stock status (default: "in_stock")
  "specifications": "object", // Optional - Key-value pairs for specs
  "tags": "string", // Optional - Comma-separated tags
  "weight": "number", // Optional - Weight in kg
  "dimensions": {
    // Optional - Product dimensions
    "length": "number",
    "width": "number",
    "height": "number"
  },
  "brand": "string", // Optional - Brand name
  "model": "string", // Optional - Model name
  "contact_preference": "string", // Optional - Contact preference (default: "both")
  "images": "file[]" // Optional - Product images (multiple files)
}
```

**Category Enum Values:**

- `"food"` - Pet food products
- `"accessories"` - Pet accessories
- `"toys"` - Pet toys
- `"health"` - Health products
- `"grooming"` - Grooming products
- `"other"` - Other products

**Availability Status Enum Values:**

- `"in_stock"` - Product is available
- `"out_of_stock"` - Product is out of stock
- `"limited_stock"` - Limited quantity available
- `"on_request"` - Available on request

**Contact Preference Enum Values:**

- `"phone"` - Phone contact only
- `"email"` - Email contact only
- `"both"` - Both phone and email

**Success Response (201):**

```json
{
  "success": true,
  "message": "Product showcase created successfully",
  "data": {
    "_id": "product_id",
    "business_id": "business_id",
    "name": "Premium Dog Food",
    "description": "High-quality nutrition for your pet",
    "category": "food",
    "price": 29.99,
    "currency": "EUR",
    "images": [
      "https://cloudinary.com/image1.jpg",
      "https://cloudinary.com/image2.jpg"
    ],
    "is_available": true,
    "availability_status": "in_stock",
    "specifications": {
      "ingredient": "Chicken, Rice, Vegetables",
      "age_group": "Adult",
      "size": "Medium/Large dogs"
    },
    "tags": ["premium", "natural", "grain-free"],
    "weight": 15,
    "dimensions": {
      "length": 40,
      "width": 25,
      "height": 60
    },
    "brand": "PetNutrition",
    "model": "Premium Plus",
    "contact_preference": "both",
    "views": 0,
    "inquiries": 0,
    "contact_clicks": 0,
    "is_featured": false,
    "featured_until": null,
    "createdAt": "2025-07-20T10:00:00.000Z",
    "updatedAt": "2025-07-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `403` - Business doesn't have product showcase permission
- `403` - Product limit reached for current subscription plan
- `500` - Server error

---

### 2. Get Business Products

**Endpoint:** `GET /product/business/:business_id`

**Description:** Get all products for a specific business with pagination and filtering.

**URL Parameters:**

- `business_id` (string, required) - The business ID

**Query Parameters:**

```
page=1                    // Optional - Page number (default: 1)
limit=10                  // Optional - Items per page (default: 10)
category=food             // Optional - Filter by category
is_featured=true          // Optional - Filter by featured status
sort_by=createdAt         // Optional - Sort field (default: createdAt)
```

**Sort Options:**

- `"createdAt"` - Sort by creation date (newest first)
- `"price"` - Sort by price (ascending)
- `"views"` - Sort by view count
- `"inquiries"` - Sort by inquiry count

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "_id": "product_id",
        "business_id": {
          "_id": "business_id",
          "company_name": "Pet Store Plus",
          "company_logo": "https://cloudinary.com/logo.jpg"
        },
        "name": "Premium Dog Food",
        "description": "High-quality nutrition for your pet",
        "category": "food",
        "price": 29.99,
        "currency": "EUR",
        "images": ["https://cloudinary.com/image1.jpg"],
        "is_available": true,
        "availability_status": "in_stock",
        "specifications": {
          "ingredient": "Chicken, Rice, Vegetables"
        },
        "tags": ["premium", "natural"],
        "weight": 15,
        "brand": "PetNutrition",
        "contact_preference": "both",
        "views": 45,
        "inquiries": 12,
        "contact_clicks": 8,
        "is_featured": true,
        "featured_until": "2025-08-20T10:00:00.000Z",
        "createdAt": "2025-07-20T10:00:00.000Z",
        "updatedAt": "2025-07-20T10:00:00.000Z"
      }
    ],
    "totalDocs": 25,
    "limit": 10,
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

### 3. Get Single Product

**Endpoint:** `GET /product/:product_id`

**Description:** Get detailed information about a specific product. Automatically tracks view analytics.

**URL Parameters:**

- `product_id` (string, required) - The product ID

**Query Parameters:**

```
user_id=user_id_here      // Optional - User ID for analytics tracking
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "product_id",
    "business_id": {
      "_id": "business_id",
      "company_name": "Pet Store Plus",
      "company_logo": "https://cloudinary.com/logo.jpg",
      "physical_address": "123 Pet Street, Animal City",
      "phone": "+1234567890",
      "email": "info@petstoreplus.com",
      "website": "https://petstoreplus.com"
    },
    "name": "Premium Dog Food",
    "description": "High-quality nutrition for your pet with natural ingredients...",
    "category": "food",
    "price": 29.99,
    "currency": "EUR",
    "images": [
      "https://cloudinary.com/image1.jpg",
      "https://cloudinary.com/image2.jpg"
    ],
    "is_available": true,
    "availability_status": "in_stock",
    "specifications": {
      "ingredient": "Chicken, Rice, Vegetables",
      "age_group": "Adult",
      "protein_content": "28%",
      "fat_content": "15%"
    },
    "tags": ["premium", "natural", "grain-free"],
    "weight": 15,
    "dimensions": {
      "length": 40,
      "width": 25,
      "height": 60
    },
    "brand": "PetNutrition",
    "model": "Premium Plus",
    "contact_preference": "both",
    "views": 46,
    "inquiries": 12,
    "contact_clicks": 8,
    "is_featured": true,
    "featured_until": "2025-08-20T10:00:00.000Z",
    "contact_info": {
      "phone": "+1234567890",
      "email": "info@petstoreplus.com",
      "website": "https://petstoreplus.com",
      "address": "123 Pet Street, Animal City",
      "contact_preference": "both"
    },
    "createdAt": "2025-07-20T10:00:00.000Z",
    "updatedAt": "2025-07-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `404` - Product not found
- `403` - Product not available (business subscription expired)
- `500` - Server error

---

### 4. Update Product

**Endpoint:** `PUT /product/:product_id`

**Description:** Update an existing product. Supports partial updates and image management.

**URL Parameters:**

- `product_id` (string, required) - The product ID

**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "name": "string", // Optional - Updated product name
  "description": "string", // Optional - Updated description
  "category": "string", // Optional - Updated category
  "price": "number", // Optional - Updated price
  "availability_status": "string", // Optional - Updated stock status
  "specifications": "object", // Optional - Updated specifications
  "tags": "string", // Optional - Updated tags (comma-separated)
  "weight": "number", // Optional - Updated weight
  "dimensions": {
    // Optional - Updated dimensions
    "length": "number",
    "width": "number",
    "height": "number"
  },
  "brand": "string", // Optional - Updated brand
  "model": "string", // Optional - Updated model
  "contact_preference": "string", // Optional - Updated contact preference
  "images": "file[]", // Optional - New images to upload
  "replace_images": "boolean" // Optional - true to replace all images, false to append
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "product_id",
    "business_id": {
      "_id": "business_id",
      "company_name": "Pet Store Plus"
    },
    "name": "Updated Premium Dog Food",
    "description": "Updated description...",
    "category": "food",
    "price": 32.99,
    "images": [
      "https://cloudinary.com/updated_image1.jpg",
      "https://cloudinary.com/updated_image2.jpg"
    ],
    // ... other fields
    "updatedAt": "2025-07-20T11:00:00.000Z"
  }
}
```

**Error Responses:**

- `404` - Product not found
- `500` - Server error

---

### 5. Delete Product

**Endpoint:** `DELETE /product/:product_id`

**Description:** Soft delete a product (marks as unavailable rather than removing from database).

**URL Parameters:**

- `product_id` (string, required) - The product ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Responses:**

- `404` - Product not found
- `500` - Server error

---

## Product Search & Discovery

### 6. Search Products

**Endpoint:** `GET /product/search`

**Description:** Search and filter products with advanced filtering, sorting, and pagination. Features intelligent sorting with featured products prioritized.

**Query Parameters:**

```
q=dog food                    // Optional - Search query (searches name, description, tags)
category=food                 // Optional - Filter by category
min_price=10                  // Optional - Minimum price filter
max_price=100                 // Optional - Maximum price filter
location=Madrid               // Optional - Location filter (future feature)
radius=50                     // Optional - Radius in km (future feature)
page=1                        // Optional - Page number (default: 1)
limit=20                      // Optional - Items per page (default: 20)
sort_by=featured              // Optional - Sort option (default: featured)
availability_status=in_stock  // Optional - Filter by availability status
```

**Sort Options:**

- `"featured"` - Featured products first, then by creation date
- `"price_low"` - Price low to high (featured products still prioritized)
- `"price_high"` - Price high to low (featured products still prioritized)
- `"newest"` - Newest first (featured products still prioritized)
- `"popular"` - Most viewed first (featured products still prioritized)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "_id": "product_id",
        "business_id": {
          "_id": "business_id",
          "company_name": "Pet Store Plus",
          "company_logo": "https://cloudinary.com/logo.jpg",
          "petpro_subscription": {
            "is_active": true
          }
        },
        "name": "Premium Dog Food",
        "description": "High-quality nutrition...",
        "category": "food",
        "price": 29.99,
        "currency": "EUR",
        "images": ["https://cloudinary.com/image1.jpg"],
        "availability_status": "in_stock",
        "tags": ["premium", "natural"],
        "brand": "PetNutrition",
        "views": 145,
        "inquiries": 23,
        "is_featured": true,
        "featured_until": "2025-08-20T10:00:00.000Z",
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

## Featured Products

### 7. Make Product Featured

**Endpoint:** `POST /product/:product_id/feature`

**Description:** Make a product featured for a specified duration. Requires PetPro subscription and respects feature limits.

**URL Parameters:**

- `product_id` (string, required) - The product ID

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
  "message": "Product is now featured",
  "featured_until": "2025-08-20T10:00:00.000Z",
  "featured_count": 3,
  "max_featured_allowed": 10
}
```

**Error Responses:**

- `404` - Product not found
- `403` - Business doesn't have featured product permission
- `403` - Featured product limit reached
- `500` - Server error

---

### 8. Expire Featured Products (Manual)

**Endpoint:** `POST /product/expire-featured`

**Description:** Manually trigger expiration of featured products that have passed their featured_until date.

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "expired_count": 5,
  "message": "5 featured products expired"
}
```

**Error Responses:**

- `500` - Server error

---

## Analytics & Tracking

### 9. Track Product Interest

**Endpoint:** `POST /product/:product_id/interest`

**Description:** Track when a user shows interest in a product (e.g., clicks "I'm interested" button).

**URL Parameters:**

- `product_id` (string, required) - The product ID

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
  "message": "Interest tracked successfully"
}
```

**Error Responses:**

- `404` - Product not found
- `500` - Server error

---

### 10. Track Contact Click

**Endpoint:** `POST /product/:product_id/contact`

**Description:** Track when a user clicks on contact information (phone, email, website).

**URL Parameters:**

- `product_id` (string, required) - The product ID

**Request Body:**

```json
{
  "user_id": "string", // Optional - User ID for analytics
  "contact_type": "string" // Required - Type of contact clicked
}
```

**Contact Type Values:**

- `"phone"` - User clicked phone number
- `"email"` - User clicked email address
- `"website"` - User clicked website link

**Success Response (200):**

```json
{
  "success": true,
  "message": "Contact interaction tracked successfully"
}
```

**Error Responses:**

- `404` - Product not found
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
- `404` - Not Found (product/business not found)
- `500` - Internal Server Error

---

## Data Types Reference

### Product Object

```typescript
{
  _id: string,
  business_id: string | BusinessObject,
  name: string,
  description: string,
  category: "food" | "accessories" | "toys" | "health" | "grooming" | "other",
  price: number,
  currency: string,
  images: string[],
  is_available: boolean,
  availability_status: "in_stock" | "out_of_stock" | "limited_stock" | "on_request",
  specifications: { [key: string]: string },
  tags: string[],
  weight?: number,
  dimensions?: {
    length?: number,
    width?: number,
    height?: number
  },
  brand?: string,
  model?: string,
  contact_preference: "phone" | "email" | "both",
  views: number,
  inquiries: number,
  contact_clicks: number,
  is_featured: boolean,
  featured_until?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Pagination Object

```typescript
{
  docs: Product[],
  totalDocs: number,
  limit: number,
  page: number,
  totalPages: number,
  hasNextPage: boolean,
  hasPrevPage: boolean,
  nextPage: number | null,
  prevPage: number | null
}
```

---

## Usage Examples

### Frontend JavaScript Examples

#### 1. Create a new product:

```javascript
const createProduct = async (productData, imageFiles) => {
  try {
    const formData = new FormData();

    // Add product data
    Object.keys(productData).forEach((key) => {
      if (key === "specifications") {
        formData.append(key, JSON.stringify(productData[key]));
      } else if (key === "dimensions") {
        formData.append(key, JSON.stringify(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    });

    // Add images
    imageFiles.forEach((file, index) => {
      formData.append("images", file);
    });

    const response = await fetch("/product/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      console.log("Product created:", result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Usage
createProduct(
  {
    business_id: "business_id_here",
    name: "Premium Dog Food",
    description: "High-quality nutrition for your pet",
    category: "food",
    price: 29.99,
    specifications: {
      ingredient: "Chicken, Rice, Vegetables",
      age_group: "Adult Dogs",
    },
    tags: "premium,natural,grain-free",
    weight: 15,
    brand: "PetNutrition",
  },
  imageFiles
);
```

#### 2. Search products:

```javascript
const searchProducts = async (searchParams) => {
  try {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`/product/search?${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (result.success) {
      console.log("Search results:", result.data);
      console.log(`Found ${result.data.totalDocs} products`);
      console.log(`Page ${result.data.page} of ${result.data.totalPages}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Usage
searchProducts({
  q: "dog food",
  category: "food",
  min_price: 10,
  max_price: 50,
  sort_by: "price_low",
  page: 1,
  limit: 20,
});
```

#### 3. Get business products:

```javascript
const getBusinessProducts = async (businessId, filters = {}) => {
  try {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(
      `/product/business/${businessId}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Business products:", result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Usage
getBusinessProducts("business_id_here", {
  category: "food",
  is_featured: "true",
  page: 1,
  limit: 10,
});
```

#### 4. Make product featured:

```javascript
const makeProductFeatured = async (productId, durationDays = 30) => {
  try {
    const response = await fetch(`/product/${productId}/feature`, {
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
      console.log("Product featured successfully");
      console.log(`Featured until: ${result.featured_until}`);
      console.log(
        `Featured count: ${result.featured_count}/${result.max_featured_allowed}`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 5. Track product interactions:

```javascript
const trackProductView = async (productId, userId = null) => {
  try {
    const queryString = userId ? `?user_id=${userId}` : "";
    const response = await fetch(`/product/${productId}${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (result.success) {
      console.log("Product view tracked:", result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const trackProductInterest = async (productId, userId = null) => {
  try {
    const response = await fetch(`/product/${productId}/interest`, {
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
      console.log("Interest tracked successfully");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const trackContactClick = async (productId, contactType, userId = null) => {
  try {
    const response = await fetch(`/product/${productId}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        contact_type: contactType,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Contact click tracked successfully");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 6. Update product with new images:

```javascript
const updateProduct = async (productId, updateData, newImages = []) => {
  try {
    const formData = new FormData();

    // Add update data
    Object.keys(updateData).forEach((key) => {
      if (typeof updateData[key] === "object" && updateData[key] !== null) {
        formData.append(key, JSON.stringify(updateData[key]));
      } else {
        formData.append(key, updateData[key]);
      }
    });

    // Add new images
    newImages.forEach((file) => {
      formData.append("images", file);
    });

    // Specify whether to replace or append images
    formData.append("replace_images", "false"); // or 'true' to replace all

    const response = await fetch(`/product/${productId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      console.log("Product updated:", result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

---

## Business Logic Notes

### Product Limits by Subscription:

- **Basic PetPro**: 25 products maximum
- **Premium PetPro**: 100 products maximum
- **No Subscription**: Cannot create products

### Featured Product Limits:

- **Basic PetPro**: 3 featured products maximum
- **Premium PetPro**: 10 featured products maximum

### Image Handling:

- Multiple images supported per product
- Images automatically optimized (800x800 max, quality: auto:good)
- Stored in Cloudinary under "petpro_products" folder
- Update supports both replacing all images or appending new ones

### Search Functionality:

- Text search across product names, descriptions, and tags
- Category filtering
- Price range filtering
- Featured products always appear first in results
- Only shows products from businesses with active subscriptions

### Analytics Tracking:

- Automatic view tracking when product details are fetched
- Manual interest tracking for user interactions
- Contact click tracking for phone/email/website clicks
- All analytics tied to business for reporting

---

## Notes for Frontend Developers

1. **File Uploads**: Always use `FormData` for endpoints that accept images.

2. **Image Management**: When updating products, use `replace_images` parameter to control whether new images replace existing ones or are appended.

3. **Subscription Checks**: Products are only visible if the business has an active PetPro subscription.

4. **Featured Products**: Featured products automatically expire based on `featured_until` date. Use the manual expire endpoint for testing.

5. **Search Performance**: Use appropriate pagination limits and implement debouncing for search queries.

6. **Analytics**: Track all user interactions for better business insights.

7. **Error Handling**: Always check subscription status and limits before allowing product creation/featuring.

8. **Categories**: Use the provided category enum values for consistency.

9. **Contact Preferences**: Respect the business's contact preference settings when showing contact options.

10. **Image Display**: Always check if images array exists and has content before displaying.

---

This documentation covers all product-related API endpoints with comprehensive examples and guidelines for frontend integration.
