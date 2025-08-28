# Tags API Documentation

This document provides comprehensive information about the Tags API endpoints for the mascotas-backend application.

## Overview

The Tags API allows administrators to create, manage, and organize tags that can be used throughout the application. Users can view active tags without authentication. Each tag includes an uploaded icon image, title, and description.

## Base URL

```
/api/tags
```

## Authentication

- **Public endpoints**: All endpoints are publicly accessible
- **Admin operations**: Require `userId` to be passed in request body
- **No JWT required**: Authentication is handled via userId parameter

## File Upload

- **Icon images**: Required for creating tags, optional for updates
- **Supported formats**: PNG, JPG, JPEG, WEBP
- **Storage**: Cloudinary with automatic optimization (100x100px)
- **Form field name**: `icon`

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
        "icon": {
          "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/sample.jpg",
          "public_id": "tags/icons/sample"
        },
        "isActive": true,
        "createdBy": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "admin",
          "email": "admin@example.com"
        },
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
    "icon": {
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/sample.jpg",
      "public_id": "tags/icons/sample"
    },
    "isActive": true,
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "admin",
      "email": "admin@example.com"
    },
    "createdAt": "2023-01-15T10:30:00.000Z",
    "updatedAt": "2023-01-15T10:30:00.000Z"
  }
}
```

### 3. Create Tag

**POST** `/api/tags`

Create a new tag with an uploaded icon image.

#### Headers

```
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

```
title: "Pet Training"
description: "Professional pet training services and tips"
userId: "507f1f77bcf86cd799439012"
icon: [Image File] (PNG, JPG, JPEG, WEBP)
```

#### Field Validations

| Field       | Type   | Required | Max Length | Description                       |
| ----------- | ------ | -------- | ---------- | --------------------------------- |
| title       | string | Yes      | 100        | Unique tag title                  |
| description | string | Yes      | 500        | Tag description                   |
| userId      | string | Yes      | -          | ID of the user creating the tag   |
| icon        | file   | Yes      | -          | Icon image (PNG, JPG, JPEG, WEBP) |

#### Response Example

```json
{
  "success": true,
  "message": "Tag created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Pet Training",
    "description": "Professional pet training services and tips",
    "icon": {
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/sample.jpg",
      "public_id": "tags/icons/sample"
    },
    "isActive": true,
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "admin",
      "email": "admin@example.com"
    },
    "createdAt": "2023-01-15T10:35:00.000Z",
    "updatedAt": "2023-01-15T10:35:00.000Z"
  }
}
```

### 4. Update Tag

**PUT** `/api/tags/:id`

Update an existing tag. Icon image is optional for updates.

#### Headers

```
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

```
title: "Advanced Pet Training" (optional)
description: "Advanced professional pet training services and expert tips" (optional)
icon: [Image File] (optional - PNG, JPG, JPEG, WEBP)
isActive: true (optional)
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
    "icon": {
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tags/icons/updated.jpg",
      "public_id": "tags/icons/updated"
    },
    "isActive": true,
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "admin",
      "email": "admin@example.com"
    },
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
        "icon": "🎾",
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
  "message": "Title, description, and userId are required"
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

```javascript
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

// Usage with file upload
const createTagWithFile = (title, description, userId, iconFile) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('userId', userId); // User ID who is creating the tag
  formData.append('icon', iconFile); // File object from input[type="file"]

  createTag(formData);
};

// HTML form example
/*
<form id="tagForm" enctype="multipart/form-data">
  <input type="text" name="title" placeholder="Tag Title" required />
  <textarea name="description" placeholder="Tag Description" required></textarea>
  <input type="hidden" name="userId" value="507f1f77bcf86cd799439012" />
  <input type="file" name="icon" accept="image/*" required />
  <button type="submit">Create Tag</button>
</form>

<script>
document.getElementById('tagForm').onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  await createTag(formData);
};
</script>
*/
    description: "Professional pet grooming services",
    icon: "✂️",
  },
  userToken
);
```

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

// Usage - Update with new icon
const updateTagWithIcon = (tagId, title, description, iconFile) => {
  const formData = new FormData();
  if (title) formData.append("title", title);
  if (description) formData.append("description", description);
  if (iconFile) formData.append("icon", iconFile); // Optional - only if changing icon

  updateTag(tagId, formData);
};

// Usage - Update without changing icon
const updateTagText = (tagId, title, description) => {
  const formData = new FormData();
  if (title) formData.append("title", title);
  if (description) formData.append("description", description);

  updateTag(tagId, formData);
};
```

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
