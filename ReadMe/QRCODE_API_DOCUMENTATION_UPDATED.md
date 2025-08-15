# QR Code API Documentation (Updated)

This documentation covers all QR Code API endpoints, including request/response formats, field explanations, error handling, and notes for Flutter frontend developers. All endpoints return JSON responses.

---

## 1. Generate Bulk QR Codes

**Endpoint:** `POST /qrcode/bulk`

**Description:** Generates multiple QR codes in bulk.

### Request

- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body:**

```json
{
  "quantity": 10 // Number of QR codes to generate (required, max 1000)
}
```

### Response

```json
{
  "success": true,
  "message": "Successfully generated 10 QR codes",
  "data": {
    "count": 10,
    "qrCodes": [
      {
        "id": "qr_id",
        "petId": null,
        "userId": null,
        "url": "https://mactos-pet-page.vercel.app/qr/qr_id",
        "qrCodeImage": "data:image/png;base64,...",
        "isActive": true,
        "createdAt": "2025-07-22T12:00:00.000Z",
        "updatedAt": "2025-07-22T12:00:00.000Z"
      }
    ]
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Please provide a valid quantity (positive number)"
}
```

---

## 2. Generate Single QR Code

**Endpoint:** `POST /qrcode/single`

**Description:** Generates a single QR code.

### Request

- **Headers:**
  - `Authorization: Bearer <token>`

### Response

```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "id": "qr_id",
    "petId": null,
    "userId": null,
    "url": "https://mactos-pet-page.vercel.app/qr/qr_id",
    "qrCodeImage": "data:image/png;base64,...",
    "isActive": true,
    "createdAt": "2025-07-22T12:05:00.000Z",
    "updatedAt": "2025-07-22T12:05:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Internal server error while generating QR code"
}
```

---

## 3. Get QR Code Info

**Endpoint:** `GET /qrcode/:qrId`

**Description:** Retrieves detailed information for a specific QR code.

### Request

- **Headers:**
  - `Authorization: Bearer <token>`
- **Path Parameter:**
  - `qrId` (string): The unique ID of the QR code

### Response

```json
{
  "success": true,
  "message": "QR code information retrieved successfully",
  "data": {
    "id": "qr_id",
    "url": "https://mactos-pet-page.vercel.app/qr/qr_id",
    "qrCodeImage": "data:image/png;base64,...",
    "isActive": true,
    "createdAt": "2025-07-22T12:00:00.000Z",
    "updatedAt": "2025-07-22T12:00:00.000Z",
    "isAssigned": true,
    "pet": {
      "_id": "pet_id",
      "pet_name": "Fluffy",
      "pet_color": "White",
      "pet_breed": "Persian"
      // ...other pet fields
    },
    "owner": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "whatsappMessage": "Hi, I found your pet Fluffy, color White, breed Persian. Please contact me."
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "QR code not found"
}
```

---

## 4. Assign Pet to QR Code

**Endpoint:** `POST /qrcode/:qrId/assign-pet`

**Description:** Creates a new pet and assigns it to a QR code. Accepts image upload for pet.

### Request

- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <token>`
- **Path Parameter:**
  - `qrId` (string): The unique ID of the QR code
- **Body:**
  - `user` (string, required): User ID
  - `pet_name` (string, required): Pet name
  - `pet_gender` (string, optional): Pet gender
  - `pet_dob` (string, optional): Date of birth
  - `pet_weight` (number, optional): Weight
  - `pet_height` (number, optional): Height
  - `pet_microchip_number` (string, optional)
  - `pet_race` (string, optional): Breed
  - `pet_description` (string, optional)
  - `pet_color` (string, optional)
  - `pet_image` (file, optional): Pet image

### Response

```json
{
  "success": true,
  "message": "Pet created and assigned to QR code successfully",
  "data": {
    "qrCode": {
      "_id": "qr_id",
      "petId": "pet_id",
      "userId": "user_id",
      "url": "https://mactos-pet-page.vercel.app/qr/qr_id",
      "qrCodeImage": "data:image/png;base64,...",
      "isActive": true,
      "createdAt": "2025-07-22T12:00:00.000Z",
      "updatedAt": "2025-07-22T12:00:00.000Z"
    },
    "pet": {
      "_id": "pet_id",
      "pet_name": "Fluffy",
      "pet_image": "https://cloudinary.com/yourimage.jpg"
      // ...other pet fields
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "QR code is already assigned to a pet"
}
```

---

## 5. Get All QR Codes

**Endpoint:** `GET /qrcode/all`

**Description:** Retrieves all QR codes, with pagination and assignment filter.

### Request

- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 50)
  - `assigned` (string, optional: "true" or "false")

### Response

```json
{
  "success": true,
  "message": "QR codes retrieved successfully",
  "data": {
    "qrCodes": [
      {
        "_id": "qr_id",
        "petId": "pet_id",
        "userId": "user_id",
        "url": "https://mactos-pet-page.vercel.app/qr/qr_id",
        "qrCodeImage": "data:image/png;base64,...",
        "isActive": true,
        "createdAt": "2025-07-22T12:00:00.000Z",
        "updatedAt": "2025-07-22T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalQRCodes": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Internal server error while retrieving QR codes"
}
```

---

## 6. Health Check

**Endpoint:** `GET /qrcode/health`

**Description:** Checks if the QR code service is running.

### Response

```json
{
  "success": true,
  "message": "QR Code service is running",
  "timestamp": "2025-07-22T12:00:00.000Z"
}
```

---

## Status Codes

- **200 OK**: Request successful
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Notes

- All endpoints return JSON responses.
- Authentication is required for all except health check.
- For more details, refer to backend controller/model logic.
- Dates are in ISO 8601 format.
- IDs are MongoDB ObjectId strings.
- Error responses include a descriptive message.
