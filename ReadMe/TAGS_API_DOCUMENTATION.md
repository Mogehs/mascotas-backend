# Tags API Documentation

This document provides comprehensive information about the Tags API endpoints for the mascotas-backend application.

## Overview

The Tags API allows users to create, manage, and organize tags that can be used throughout the application. Each tag includes multiple uploaded icon images, title, and description. All endpoints are publicly accessible and no authentication is required.

## Base URL

```
/api/tags
```

## Authentication

- **Public access**: All endpoints are publicly accessible
- **No authentication required**: No JWT tokens or user identification needed

## File Upload

- **Icon images**: Multiple icons supported per tag (at least one required for creating)
- **Supported formats**: PNG, JPG, JPEG, WEBP
- **Storage**: Cloudinary with automatic optimization (100x100px)
- **Form field name**: `icons` (supports multiple files)
- **Data handling**: Supports stringified JSON data in multipart requests

## Endpoints

### 1. Get All Tags

**GET** `/api/tags`

Retrieve all tags with pagination and filtering options.

#### Query Parameters

| Parameter | Type    | Required | Description                                        |
| --------- | ------- | -------- | -------------------------------------------------- |
| page      | number  | No       | Page number (default: 1)                           |
| limit     | number  | No       | Items per page (default: 10)                       |
| search    | string  | No       | Search in title and description                    |
| isActive  | boolean | No       | Filter by active status (default: true for public) |

#### Request Example

```bash
GET /api/tags?page=1&limit=5&search=pet&isActive=true
```

#### Response Example

```json
{
  "success": true,
  "message": "Tags retrieved successfully",
  "data": {
    "tags": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Pet Care",
        "description": "Everything related to pet care and maintenance",
        "price": 19.99,
        "icons": [
          {
            "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/sample.jpg",
            "public_id": "tags/icons/sample"
          }
        ],
        "isActive": true,
        "createdAt": "2023-01-15T10:30:00.000Z",
        "updatedAt": "2023-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 5,
      "pages": 3
    }
  }
}
```

### 2. Get Tag by ID

**GET** `/api/tags/:id`

Retrieve a specific tag by its ID.

#### Request Example

```bash
GET /api/tags/507f1f77bcf86cd799439011
```

#### Response Example

```json
{
  "success": true,
  "message": "Tag retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Pet Care",
    "description": "Everything related to pet care and maintenance",
    "price": 19.99,
    "icons": [
      {
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/sample.jpg",
        "public_id": "tags/icons/sample"
      }
    ],
    "isActive": true,
    "createdAt": "2023-01-15T10:30:00.000Z",
    "updatedAt": "2023-01-15T10:30:00.000Z"
  }
}
```

### 3. Create Tag

**POST** `/api/tags`

Create a new tag with multiple uploaded icon images.

#### Headers

```
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

```
title: "Pet Training" (can be stringified JSON)
description: "Professional pet training services and tips" (can be stringified JSON)
icons: [Multiple Image Files] (PNG, JPG, JPEG, WEBP)
```

#### Field Validations

| Field       | Type   | Required | Max Length | Description                                 |
| ----------- | ------ | -------- | ---------- | ------------------------------------------- |
| title       | string | Yes      | 100        | Unique tag title                            |
| description | string | Yes      | 500        | Tag description                             |
| price       | number | Yes      | -          | Tag price (must be positive number)         |
| icons       | files  | Yes      | -          | Multiple icon images (PNG, JPG, JPEG, WEBP) |

#### Response Example

```json
{
  "success": true,
  "message": "Tag created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Pet Training",
    "description": "Professional pet training services and tips",
    "price": 29.99,
    "icons": [
      {
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/icon1.jpg",
        "public_id": "tags/icons/icon1"
      },
      {
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/icon2.jpg",
        "public_id": "tags/icons/icon2"
      }
    ],
    "isActive": true,
    "createdAt": "2023-01-15T10:35:00.000Z",
    "updatedAt": "2023-01-15T10:35:00.000Z"
  }
}
```

### 4. Update Tag

**PUT** `/api/tags/:id`

Update an existing tag. Icons are optional for updates - if provided, all existing icons will be replaced.

#### Headers

```
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

```
title: "Advanced Pet Training" (optional, can be stringified JSON)
description: "Advanced professional pet training services and expert tips" (optional, can be stringified JSON)
price: 39.99 (optional, can be stringified JSON)
icons: [Multiple Image Files] (optional - PNG, JPG, JPEG, WEBP)
isActive: true (optional, can be stringified JSON)
```

#### Response Example

```json
{
  "success": true,
  "message": "Tag updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Advanced Pet Training",
    "description": "Advanced professional pet training services and expert tips",
    "price": 39.99,
    "icons": [
      {
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/updated1.jpg",
        "public_id": "tags/icons/updated1"
      },
      {
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/updated2.jpg",
        "public_id": "tags/icons/updated2"
      }
    ],
    "isActive": true,
    "createdAt": "2023-01-15T10:35:00.000Z",
    "updatedAt": "2023-01-15T10:40:00.000Z"
  }
}
```

### 5. Delete Tag

**DELETE** `/api/tags/:id`

Permanently delete a tag.

#### Request Example

```bash
DELETE /api/tags/507f1f77bcf86cd799439013
```

#### Response Example

```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

### 6. Toggle Tag Status

**PATCH** `/api/tags/:id/toggle-status`

Toggle the active status of a tag (activate/deactivate).

#### Request Example

```bash
PATCH /api/tags/507f1f77bcf86cd799439013/toggle-status
```

#### Response Example

```json
{
  "success": true,
  "message": "Tag deactivated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Advanced Pet Training",
    "description": "Advanced professional pet training services and expert tips",
    "icon": "🏆",
    "isActive": false,
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "admin",
      "email": "admin@example.com"
    },
    "createdAt": "2023-01-15T10:35:00.000Z",
    "updatedAt": "2023-01-15T10:45:00.000Z"
  }
}
```

### 7. Get Tags Statistics

**GET** `/api/tags/admin/stats`

Get comprehensive statistics about tags.

#### Request Example

```bash
GET /api/tags/admin/stats
```

#### Response Example

```json
{
  "success": true,
  "message": "Tags statistics retrieved successfully",
  "data": {
    "stats": {
      "total": 25,
      "active": 20,
      "inactive": 5
    },
    "recentTags": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Pet Training",
        "description": "Professional pet training services and tips",
        "price": 29.99,
        "icons": [
          {
            "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/icon.jpg",
            "public_id": "tags/icons/icon"
          }
        ],
        "isActive": true,
        "createdBy": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "admin",
          "email": "admin@example.com"
        },
        "createdAt": "2023-01-15T10:35:00.000Z",
        "updatedAt": "2023-01-15T10:35:00.000Z"
      }
    ]
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Title, description, and price are required"
}
```

```json
{
  "success": false,
  "message": "Price must be a valid positive number"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Tag not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "Tag with this title already exists"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Server error while creating tag",
  "error": "Error details..."
}
```

## Usage Examples

### Frontend Implementation Example (JavaScript)

#### Get All Tags

```javascript
const fetchTags = async () => {
  try {
    const response = await fetch("/api/tags?page=1&limit=10");
    const data = await response.json();

    if (data.success) {
      console.log("Tags:", data.data.tags);
      console.log("Pagination:", data.data.pagination);
    }
  } catch (error) {
    console.error("Error fetching tags:", error);
  }
};
```

#### Create Tag

````javascript
const createTag = async (formData) => {
  try {
    const response = await fetch("/api/tags", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      console.log("Tag created:", data.data);
    } else {
      console.error("Error:", data.message);
    }
  } catch (error) {
    console.error("Error creating tag:", error);
  }
};

// Usage with multiple files upload
const createTagWithFiles = (title, description, price, iconFiles) => {
  const formData = new FormData();

  // Handle stringified data if needed
  formData.append('title', JSON.stringify(title));
  formData.append('description', JSON.stringify(description));
  formData.append('price', JSON.stringify(price));

  // Append multiple icon files
  iconFiles.forEach((file) => {
    formData.append('icons', file); // Multiple files with same field name
  });

  createTag(formData);
};

// HTML form example with multiple file selection
/*
<form id="tagForm" enctype="multipart/form-data">
  <input type="text" name="title" placeholder="Tag Title" required />
  <textarea name="description" placeholder="Tag Description" required></textarea>
  <input type="number" name="price" placeholder="Tag Price" step="0.01" min="0" required />
  <input type="file" name="icons" accept="image/*" multiple required />
  <button type="submit">Create Tag</button>
</form><script>
document.getElementById('tagForm').onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  await createTag(formData);
};
</script>
*/

#### Update Tag

```javascript
const updateTag = async (tagId, formData) => {
  try {
    const response = await fetch(`/api/tags/${tagId}`, {
      method: "PUT",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      console.log("Tag updated:", data.data);
    } else {
      console.error("Error:", data.message);
    }
  } catch (error) {
    console.error("Error updating tag:", error);
  }
};

// Usage - Update with new icons (replaces all existing icons)
const updateTagWithIcons = (tagId, title, description, iconFiles) => {
  const formData = new FormData();

  // Handle stringified data if needed
  if (title) formData.append("title", JSON.stringify(title));
  if (description) formData.append("description", JSON.stringify(description));

  // Append multiple icon files if provided
  if (iconFiles && iconFiles.length > 0) {
    iconFiles.forEach((file) => {
      formData.append("icons", file); // Multiple files with same field name
    });
  }

  updateTag(tagId, formData);
};

// Usage - Update without changing icons
const updateTagText = (tagId, title, description) => {
  const formData = new FormData();
  if (title) formData.append("title", JSON.stringify(title));
  if (description) formData.append("description", JSON.stringify(description));

  updateTag(tagId, formData);
};
````

## Notes

1. **Authentication**: No JWT tokens required - pass userId in request body for admin operations
2. **Public Access**: All endpoints are publicly accessible
3. **File Upload**: Uses express-fileupload middleware for handling image uploads
4. **Image Storage**: Icons are stored on Cloudinary with automatic optimization (100x100px)
5. **Supported Formats**: PNG, JPG, JPEG, WEBP image files
6. **Validation**: All text fields are trimmed and validated
7. **User Identification**: userId must be provided in request body for create operations
8. **Uniqueness**: Tag titles must be unique (case-insensitive)
9. **Pagination**: Default pagination is 10 items per page
10. **Soft Delete**: Use toggle status instead of hard delete when possible
11. **Search**: Supports case-insensitive search in title and description
12. **File Cleanup**: Temporary files are automatically cleaned up after upload
13. **Image Management**: Old icons are deleted from Cloudinary when updated or tag is deleted

## Best Practices

1. Use descriptive titles and detailed descriptions
2. Upload clear, high-quality icon images (will be resized to 100x100px)
3. Use appropriate file formats (PNG recommended for icons with transparency)
4. Regularly review and clean up unused or inactive tags
5. Use the search functionality to avoid creating duplicate tags
6. Monitor tag statistics to understand usage patterns
7. Keep icon file sizes reasonable (under 5MB recommended)
8. Test icon visibility at 100x100px resolution before uploading
