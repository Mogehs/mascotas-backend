# Lost Pet API Documentation

## Base URL

```
/api/lost
```

## Endpoints

### 1. Add Lost Pet

**POST** `/addLost`

Register a new lost pet with image upload and send push notifications to all users.

#### Request Headers

```
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

```javascript
{
  "user": "string",                    // Required - User ID (ObjectId)
  "name": "string",                    // Required - Pet name
  "location": "string",                // Required - Location where pet was lost
  "date": "string",                    // Required - Date when pet was lost (format: "YYYY-MM-DD")
  "time": "string",                    // Required - Time when pet was lost (format: "HH:MM")
  "contact": "string",                 // Required - Contact phone number
  "details": "string",                 // Required - Additional details about the lost pet
  "latitude": "string",                // Optional - GPS latitude coordinate
  "longitude": "string",               // Optional - GPS longitude coordinate
  "picture": "file"                    // Required - Pet image file
}
```

#### Response

```javascript
{
  "success": true,
  "message": "La información de la mascota perdida se ha guardado correctamente",
  "data": {
    "_id": "string",
    "user": "string",
    "pet_name": "string",
    "location": "string",
    "date": "string",
    "time": "string",
    "contact": "string",
    "details": "string",
    "pet_image": "string",             // Cloudinary URL
    "latitude": "string",
    "longitude": "string",
    "createdAt": "2025-01-15T00:00:00.000Z",
    "updatedAt": "2025-01-15T00:00:00.000Z"
  }
}
```

#### Push Notification Details

When a lost pet is added, push notifications are automatically sent to all other users with the following data:

- **Title**: "Nombre de mascota perdido: {pet_name}"
- **Body**: "Número de teléfono del propietario: {contact} \n Ubicación perdida: {location} \n Tiempo perdido: {time}"
- **Additional Data**: pet name, image, location, time, contact, date, details

### 2. Get All User's Lost Pets

**POST** `/all-lost-pets`

Get all lost pets belonging to a specific user.

#### Request Body

```javascript
{
  "user": "string"                     // Required - User ID (ObjectId)
}
```

#### Response

```javascript
{
  "success": true,
  "message": "Mascotas perdidas recuperadas con éxito",
  "data": [
    {
      "_id": "string",
      "user": "string",
      "pet_name": "string",
      "location": "string",
      "date": "string",
      "time": "string",
      "contact": "string",
      "details": "string",
      "pet_image": "string",
      "latitude": "string",
      "longitude": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### 3. Get Lost Pet by ID

**GET** `/:id`

Get a specific lost pet by its ID with populated user information.

#### URL Parameters

```
id: string (required) - Lost Pet ID (ObjectId)
```

#### Response

```javascript
{
  "success": true,
  "message": "Detalles de la mascota perdida obtenidos correctamente",
  "data": {
    "_id": "string",
    "user": {
      "_id": "string",
      "firstname": "string",
      "lastname": "string",
      "phone": "string",
      "address": "string",
      "email": "string",
      "device_token": "string"
    },
    "pet_name": "string",
    "location": "string",
    "date": "string",
    "time": "string",
    "contact": "string",
    "details": "string",
    "pet_image": "string",
    "latitude": "string",
    "longitude": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 4. Update Lost Pet

**POST** `/update`

Update an existing lost pet's information.

#### Request Body

```javascript
{
  "id": "string",                      // Required - Lost Pet ID (ObjectId)
  "name": "string",                    // Optional - Pet name
  "location": "string",                // Optional - Location where pet was lost
  "date": "string",                    // Optional - Date when pet was lost
  "time": "string",                    // Optional - Time when pet was lost
  "contact": "string",                 // Optional - Contact phone number
  "details": "string"                  // Optional - Additional details
}
```

#### Response

```javascript
{
  "success": true,
  "message": "Se han actualizado los detalles de la mascota perdida."
}
```

### 5. Delete Lost Pet

**POST** `/delete`

Permanently delete a lost pet from the database.

#### Request Body

```javascript
{
  "id": "string"                       // Required - Lost Pet ID to delete (ObjectId)
}
```

#### Response

```javascript
{
  "success": true,
  "message": "La información de la mascota perdida se ha eliminado de forma permanente."
}
```

## Error Responses

### 400 Bad Request

```javascript
{
  "success": false,
  "message": "Por favor sube la imagen de la mascota"
}
```

### 404 Not Found

```javascript
{
  "success": false,
  "message": "Mascota perdida no encontrada"
}
```

### 500 Internal Server Error

```javascript
{
  "success": false,
  "message": "Error message description"
}
```

## Data Types

### Lost Pet Object Fields

- `_id`: MongoDB ObjectId (string)
- `user`: User ObjectId reference (string)
- `pet_name`: Lost pet's name (string)
- `location`: Location where pet was lost (string)
- `date`: Date when pet was lost (string)
- `time`: Time when pet was lost (string)
- `contact`: Contact phone number (string)
- `details`: Additional details about the lost pet (string)
- `pet_image`: Cloudinary image URL (string)
- `latitude`: GPS latitude coordinate (string, default: "N/A")
- `longitude`: GPS longitude coordinate (string, default: "N/A")
- `createdAt`: Creation timestamp (string)
- `updatedAt`: Last update timestamp (string)

### User Object Fields (when populated)

- `_id`: User MongoDB ObjectId (string)
- `firstname`: User's first name (string)
- `lastname`: User's last name (string)
- `phone`: User's phone number (string)
- `address`: User's address (string)
- `email`: User's email address (string)
- `device_token`: User's device token for push notifications (string)

## Push Notification System

### Firebase Cloud Messaging (FCM)

The API uses Firebase Cloud Messaging to send push notifications when a new lost pet is registered.

#### Notification Structure

```javascript
{
  "token": "device_token",
  "notification": {
    "title": "Nombre de mascota perdido: {pet_name}",
    "body": "Número de teléfono del propietario: {contact} \n Ubicación perdida: {location} \n Tiempo perdido: {time}"
  },
  "data": {
    "type": "pet",
    "name": "pet_name",
    "image": "cloudinary_url",
    "location": "location",
    "time": "time",
    "contact": "contact_number",
    "date": "date",
    "details": "additional_details"
  }
}
```

#### Notification Recipients

- All users in the database (except the one who posted the lost pet)
- Only users with valid device tokens
- Notifications are sent asynchronously using Promise.all()

## Implementation Notes

### Image Upload

- All images are uploaded to Cloudinary
- File must be sent as multipart/form-data with field name "picture"
- Images are stored in the "mascotas" folder on Cloudinary

### GPS Coordinates

- Latitude and longitude are optional fields
- Default value is "N/A" if not provided
- Can be used for mapping and proximity features

### Date and Time Formats

- Date: "YYYY-MM-DD" format recommended
- Time: "HH:MM" format recommended
- Both are stored as strings for flexibility

### User Population

When getting lost pet by ID, user information is populated with:

- firstname, lastname, phone, address, email, device_token

### Error Handling

- All endpoints include comprehensive error handling
- Errors are logged to console for debugging
- User-friendly error messages in Spanish
- Proper HTTP status codes are returned

## Security Considerations

- User authentication should be implemented before using these endpoints
- File upload validation should be implemented
- Rate limiting recommended for notification endpoints
- Device token validation for push notifications

## Usage Examples

### Frontend Integration

```javascript
// Add lost pet
const formData = new FormData();
formData.append("user", userId);
formData.append("name", petName);
formData.append("location", location);
formData.append("date", date);
formData.append("time", time);
formData.append("contact", contactNumber);
formData.append("details", details);
formData.append("picture", imageFile);

fetch("/api/lost/addLost", {
  method: "POST",
  body: formData,
});

// Get user's lost pets
fetch("/api/lost/all-lost-pets", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ user: userId }),
});

// Get lost pet by ID
fetch(`/api/lost/${petId}`, {
  method: "GET",
});
```
