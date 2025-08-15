# Pet API Documentation

## Base URL

```
/api/pet
```

## Endpoints

### 1. Register Pet

**POST** `/register_pet`

Register a new pet with image upload.

#### Request Headers

```
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

```javascript
{
  "user": "string",                    // Required - User ID (ObjectId)
  "name": "string",                    // Required - Pet name
  "gender": "string",                  // Required - Pet gender (e.g., "Male", "Female")
  "dob": "string",                     // Required - Date of birth (format: "YYYY-MM-DD")
  "weight": "string",                  // Required - Pet weight (e.g., "5kg")
  "height": "string",                  // Required - Pet height (e.g., "30cm")
  "microchip_number": "string",        // Optional - Microchip number
  "race": "string",                    // Required - Pet race/breed
  "description": "string",             // Required - Pet description
  "color": "string",                   // Required - Pet color
  "pet": "string",                     // Required - Pet type (e.g., "Dog", "Cat")
  "picture": "file"                    // Required - Pet image file
}
```

#### Response

```javascript
{
  "success": true,
  "message": "La información de la mascota se guardó correctamente",
  "data": {
    "_id": "string",
    "user": "string",
    "pet_name": "string",
    "pet_gender": "string",
    "pet_dob": "string",
    "pet_weight": "string",
    "pet_height": "string",
    "pet_microchip_number": "string",
    "pet_race": "string",
    "pet_description": "string",
    "pet_color": "string",
    "pet": "string",
    "pet_image": "string",             // Cloudinary URL
    "likes": [],
    "discards": [],
    "isNeutered": "No",
    "temperament": [],
    "pet_socialize": "No",
    "preferred_time": [],
    "preferred_location": "N/A",
    "pet_size": "Todos",
    "preferred_age": "1-5 años",
    "notes_other": "Prefiere perros tranquilos",
    "createdAt": "2025-01-15T00:00:00.000Z",
    "updatedAt": "2025-01-15T00:00:00.000Z"
  }
}
```

### 2. Get All User Pets

**POST** `/pets`

Get all pets belonging to a specific user.

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
  "message": "Información de la mascota obtenida correctamente",
  "pets_list": [
    {
      "_id": "string",
      "user": {
        "_id": "string",
        "firstname": "string",
        "lastname": "string",
        "phone": "string",
        "address": "string"
      },
      "pet_name": "string",
      "pet_gender": "string",
      "pet_dob": "string",
      "pet_weight": "string",
      "pet_height": "string",
      "pet_microchip_number": "string",
      "pet_race": "string",
      "pet_description": "string",
      "pet_color": "string",
      "pet": "string",
      "pet_image": "string",
      "likes": [],
      "discards": [],
      "isNeutered": "string",
      "temperament": ["string"],
      "pet_socialize": "string",
      "preferred_time": ["string"],
      "preferred_location": "string",
      "pet_size": "string",
      "distance": "string",
      "preferred_age": "string",
      "notes_other": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### 3. Get Pet by ID

**POST** `/:id`

Get a specific pet by its ID.

#### URL Parameters

```
id: string (required) - Pet ID (ObjectId)
```

#### Response

```javascript
{
  "success": true,
  "message": "Información de la mascota obtenida correctamente",
  "pet": {
    "_id": "string",
    "user": {
      "_id": "string",
      "firstname": "string",
      "lastname": "string",
      "phone": "string",
      "address": "string"
    },
    "pet_name": "string",
    "pet_gender": "string",
    "pet_dob": "string",
    "pet_weight": "string",
    "pet_height": "string",
    "pet_microchip_number": "string",
    "pet_race": "string",
    "pet_description": "string",
    "pet_color": "string",
    "pet": "string",
    "pet_image": "string",
    "likes": [],
    "discards": [],
    "isNeutered": "string",
    "temperament": ["string"],
    "pet_socialize": "string",
    "preferred_time": ["string"],
    "preferred_location": "string",
    "pet_size": "string",
    "distance": "string",
    "preferred_age": "string",
    "notes_other": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 4. Update Pet

**PUT** `/:id`

Update an existing pet's information.

#### URL Parameters

```
id: string (required) - Pet ID (ObjectId)
```

#### Request Headers

```
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

```javascript
{
  "name": "string",                    // Optional - Pet name
  "gender": "string",                  // Optional - Pet gender
  "dob": "string",                     // Optional - Date of birth
  "weight": "string",                  // Optional - Pet weight
  "height": "string",                  // Optional - Pet height
  "microchip_number": "string",        // Optional - Microchip number
  "race": "string",                    // Optional - Pet race/breed
  "description": "string",             // Optional - Pet description
  "color": "string",                   // Optional - Pet color
  "pet": "string",                     // Optional - Pet type
  "picture": "file"                    // Optional - New pet image file
}
```

#### Response

```javascript
{
  "success": true,
  "message": "La información de la mascota se actualizó correctamente",
  "data": {
    "_id": "string",
    "user": {
      "_id": "string",
      "firstname": "string",
      "lastname": "string",
      "phone": "string",
      "address": "string"
    },
    "pet_name": "string",
    "pet_gender": "string",
    "pet_dob": "string",
    "pet_weight": "string",
    "pet_height": "string",
    "pet_microchip_number": "string",
    "pet_race": "string",
    "pet_description": "string",
    "pet_color": "string",
    "pet": "string",
    "pet_image": "string",
    "likes": [],
    "discards": [],
    "isNeutered": "string",
    "temperament": ["string"],
    "pet_socialize": "string",
    "preferred_time": ["string"],
    "preferred_location": "string",
    "pet_size": "string",
    "distance": "string",
    "preferred_age": "string",
    "notes_other": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 5. Like Pet

**POST** `/like`

Add or remove a pet from favorites.

#### Request Body

```javascript
{
  "id": "string",                      // Required - Pet ID to like/unlike
  "userID": "string"                   // Required - User ID who is liking
}
```

#### Response (Like Added)

```javascript
{
  "success": true,
  "message": "Tu favorita la mascota."
}
```

#### Response (Like Removed)

```javascript
{
  "success": true,
  "message": "Te eliminaron de favoritos"
}
```

### 6. Dog Match Settings

**POST** `/match`

Update dog matching preferences for a pet.

#### Request Body

```javascript
{
  "id": "string",                      // Required - Pet ID (ObjectId)
  "neutered": "string",                // Required - Neutered status ("Yes"/"No")
  "temperament": ["string"],           // Required - Array of temperament traits
  "socialize": "string",               // Required - Socialization preference ("Yes"/"No")
  "time": ["string"],                  // Required - Array of preferred times
  "location": "string",                // Required - Preferred location
  "size": "string",                    // Required - Preferred size ("Small"/"Medium"/"Large"/"Todos")
  "distance": "string",                // Required - Maximum distance (e.g., "5km")
  "age": "string",                     // Required - Preferred age range (e.g., "1-5 años")
  "notes": "string"                    // Required - Additional notes
}
```

#### Response

```javascript
{
  "success": true,
  "message": "Se ha guardado la información del partido del perro",
  "pet_details": {
    "_id": "string",
    "user": "string",
    "pet_name": "string",
    "pet_gender": "string",
    "pet_dob": "string",
    "pet_weight": "string",
    "pet_height": "string",
    "pet_microchip_number": "string",
    "pet_race": "string",
    "pet_description": "string",
    "pet_color": "string",
    "pet": "string",
    "pet_image": "string",
    "likes": [],
    "discards": [],
    "isNeutered": "string",
    "temperament": ["string"],
    "pet_socialize": "string",
    "preferred_time": ["string"],
    "preferred_location": "string",
    "pet_size": "string",
    "distance": "string",
    "preferred_age": "string",
    "notes_other": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 7. Discard Pet

**POST** `/discard`

Add a pet to the discard list (swipe left functionality).

#### Request Body

```javascript
{
  "id": "string",                      // Required - Pet ID to discard
  "userID": "string"                   // Required - User ID who is discarding
}
```

#### Response

```javascript
{
  "success": true,
  "message": "Descartar el perfil."
}
```

### 8. Delete Pet

**POST** `/delete`

Permanently delete a pet from the database.

#### Request Body

```javascript
{
  "id": "string"                       // Required - Pet ID to delete (ObjectId)
}
```

#### Response

```javascript
{
  "success": true,
  "message": "La mascota ha sido eliminada."
}
```

## Error Responses

### 400 Bad Request

```javascript
{
  "success": false,
  "message": "Pet not found"
}
```

### 404 Not Found

```javascript
{
  "success": false,
  "message": "Mascota no encontrada para este usuario"
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

### Pet Object Fields

- `_id`: MongoDB ObjectId (string)
- `user`: User ObjectId reference (string)
- `pet_name`: Pet's name (string)
- `pet_gender`: Pet's gender (string)
- `pet_dob`: Date of birth (string)
- `pet_weight`: Pet's weight (string)
- `pet_height`: Pet's height (string)
- `pet_microchip_number`: Microchip number (string, default: "N/A")
- `pet_race`: Pet's breed/race (string)
- `pet_description`: Pet description (string)
- `pet_color`: Pet's color (string)
- `pet`: Pet type (string)
- `pet_image`: Cloudinary image URL (string)
- `likes`: Array of like objects
- `discards`: Array of discard objects
- `isNeutered`: Neutered status (string, default: "No")
- `temperament`: Array of temperament traits (array)
- `pet_socialize`: Socialization preference (string, default: "No")
- `preferred_time`: Array of preferred times (array)
- `preferred_location`: Preferred location (string, default: "N/A")
- `pet_size`: Preferred size (string, default: "Todos")
- `distance`: Maximum distance (string)
- `preferred_age`: Preferred age range (string, default: "1-5 años")
- `notes_other`: Additional notes (string, default: "Prefiere perros tranquilos")
- `createdAt`: Creation timestamp (string)
- `updatedAt`: Last update timestamp (string)

## Notes

- All image uploads are processed through Cloudinary
- File uploads must be sent as multipart/form-data
- User population includes: firstname, lastname, phone, address
- Dates should be in YYYY-MM-DD format
- All responses are in JSON format
- Error messages are primarily in Spanish
