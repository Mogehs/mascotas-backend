# Pet API Documentation

## Base URL

```
/api/pet
```

## Form Data Handling

This API supports both JSON and multipart form data submissions. When sending data as form-data (especially for file uploads), the backend automatically parses nested objects and arrays:

### Form Data Examples

**Coordinates can be sent as:**

- JSON object: `coordinates: { "latitude": 12.22, "longitude": 34.44 }`
- Separate fields: `coordinates[latitude]: "12.22"` and `coordinates[longitude]: "34.44"`
- String: `coordinates: '{"latitude": 12.22, "longitude": 34.44}'`

**Arrays can be sent as:**

- JSON array: `temperament: ["friendly", "playful"]`
- Stringified JSON: `temperament: '["friendly", "playful"]'`
- Individual values: `temperament: "friendly"` (will be converted to array)

**Numbers are automatically parsed:**

- `searchRadius: "15"` → `searchRadius: 15`

## Endpoints

### 1. Register Pet

**POST** `/register_pet`

Register a new pet with image upload and optional dog match preferences.

#### Request Headers

```
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

**Option 1: Standard JSON-like form data**

```javascript
{
  // Required Pet Fields
  "user": "string",                    // Required - User ID (ObjectId)
  "name": "string",                    // Required - Pet name
  "gender": "string",                  // Required - Pet gender (e.g., "Male", "Female")
  "dob": "string",                     // Required - Date of birth (format: "YYYY-MM-DD")
  "weight": "string",                  // Optional - Pet weight (e.g., "5kg")
  "height": "string",                  // Optional - Pet height (e.g., "30cm")
  "microchip_number": "string",        // Optional - Microchip number
  "race": "string",                    // Optional - Pet race/breed
  "description": "string",             // Optional - Pet description
  "color": "string",                   // Optional - Pet color
  "pet": "string",                     // Required - Pet type (e.g., "Dog", "Cat")
  "picture": "file",                   // Required - Pet image file

  // Optional Dog Match Preferences (will auto-create preferences if provided)
  "neutered": "string",                // Optional - Neutered status ("Yes"/"No")
  "temperament": '["friendly","playful"]',  // Optional - JSON string of temperament array
  "socialize": "string",               // Optional - Socialization preference ("Yes"/"No")
  "time": '["morning","evening"]',     // Optional - JSON string of time array
  "location": "string",                // Optional - Preferred location
  "size": "string",                    // Optional - Preferred size
  "age": "string",                     // Optional - Preferred age range
  "coordinates": '{"latitude":12.22,"longitude":34.44}',  // Optional - JSON string coordinates
  "searchRadius": "10"                 // Optional - Search radius in km (default: 10)
}
```

**Option 2: Separate field form data (recommended for frontend forms)**

```javascript
{
  // Required Pet Fields
  "user": "string",
  "name": "string",
  "gender": "string",
  "dob": "string",
  "pet": "string",
  "picture": "file",

  // Optional Pet Fields
  "weight": "string",
  "height": "string",
  "microchip_number": "string",
  "race": "string",
  "description": "string",
  "color": "string",

  // Optional Dog Match Preferences with separate coordinate fields
  "neutered": "string",
  "temperament": '["friendly","playful"]',
  "socialize": "string",
  "time": '["morning","evening"]',
  "location": "string",
  "size": "string",
  "age": "string",
  "coordinates[latitude]": "12.22",    // Coordinate latitude as separate field
  "coordinates[longitude]": "34.44",   // Coordinate longitude as separate field
  "searchRadius": "10"
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
    "createdAt": "2025-01-15T00:00:00.000Z",
    "updatedAt": "2025-01-15T00:00:00.000Z"
  },
  // Included if dog match preferences were created
  "dogMatchPreferences": {
    "_id": "string",
    "user": "string",
    "pet": "string",
    "neutered": "string",
    "temperament": ["string"],
    "socialize": "string",
    "time": ["string"],
    "location": "string",
    "size": "string",
    "age": "string",
    "coordinates": {
      "latitude": "number",
      "longitude": "number"
    },
    "searchRadius": "number",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  },
  "matchingUsers": "number",           // Number of users that match
  "notificationsSent": "number"        // Number of notifications sent
}
```

### 2. Get All User Pets

**POST** `/pets`

Get all pets belonging to a specific user with QR codes and dog match preferences.

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
      "createdAt": "string",
      "updatedAt": "string",
      // QR Code data (if available)
      "qrCode": {
        "_id": "string",
        "petId": "string",
        "qrCodeData": "string",
        "createdAt": "string"
      },
      // Dog Match Preferences (if available)
      "dogMatchPreferences": {
        "_id": "string",
        "user": "string",
        "pet": "string",
        "neutered": "string",
        "temperament": ["string"],
        "socialize": "string",
        "time": ["string"],
        "location": "string",
        "size": "string",
        "age": "string",
        "coordinates": {
          "latitude": "number",
          "longitude": "number"
        },
        "searchRadius": "number",
        "isActive": "boolean",
        "createdAt": "string",
        "updatedAt": "string"
      }
    }
  ]
}
```

### 3. Get Pet by ID

**POST** `/:id`

Get a specific pet by its ID with QR code and dog match preferences.

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
    "createdAt": "string",
    "updatedAt": "string",
    // QR Code data (if available)
    "qrCode": {
      "_id": "string",
      "petId": "string",
      "qrCodeData": "string",
      "createdAt": "string"
    },
    // Dog Match Preferences (if available)
    "dogMatchPreferences": {
      "_id": "string",
      "user": "string",
      "pet": "string",
      "neutered": "string",
      "temperament": ["string"],
      "socialize": "string",
      "time": ["string"],
      "location": "string",
      "size": "string",
      "age": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "searchRadius": "number",
      "isActive": "boolean",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

### 4. Update Pet

**PUT** `/:id`

Update an existing pet's information and optionally update dog match preferences.

#### URL Parameters

```
id: string (required) - Pet ID (ObjectId)
```

#### Request Headers

```
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

**Standard form data with flexible field formats:**

```javascript
{
  // Optional Pet Fields
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
  "picture": "file",                   // Optional - New pet image file

  // Optional Dog Match Preferences Update (multiple format options)
  "neutered": "string",                // Optional - Neutered status

  // Temperament can be sent as:
  "temperament": '["friendly","playful"]',     // JSON string array
  // OR "temperament": "friendly",             // Single value (converted to array)

  "socialize": "string",               // Optional - Socialization preference

  // Time can be sent as:
  "time": '["morning","evening"]',     // JSON string array
  // OR "time": "morning",              // Single value (converted to array)

  "location": "string",                // Optional - Preferred location
  "size": "string",                    // Optional - Preferred size
  "age": "string",                     // Optional - Preferred age range

  // Coordinates can be sent as:
  "coordinates[latitude]": "12.22",    // Separate fields (recommended)
  "coordinates[longitude]": "34.44",
  // OR "coordinates": '{"latitude":12.22,"longitude":34.44}',  // JSON string

  "searchRadius": "10"                 // Optional - Search radius in km (auto-parsed to number)
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
    "createdAt": "string",
    "updatedAt": "string"
  },
  // Included if dog match preferences were updated
  "dogMatchPreferences": {
    "_id": "string",
    "user": "string",
    "pet": "string",
    "neutered": "string",
    "temperament": ["string"],
    "socialize": "string",
    "time": ["string"],
    "location": "string",
    "size": "string",
    "age": "string",
    "coordinates": {
      "latitude": "number",
      "longitude": "number"
    },
    "searchRadius": "number",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  },
  "matchingUsers": "number",           // Number of users that match
  "notificationsSent": "number"        // Number of notifications sent
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

### 6. Dog Match Settings (Legacy)

**POST** `/match`

Legacy endpoint for updating dog matching preferences (deprecated - use new dog match APIs instead).

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

Permanently delete a pet and all associated data (QR codes, dog match preferences, lost pet records).

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
  "message": "La mascota y todos sus datos asociados han sido eliminados."
}
```

---

## Dog Match Preferences API

### 9. Create/Update Dog Match Preferences

**POST** `/dogmatch/preferences`

Create or update dog match preferences for a specific pet.

#### Request Body

**Option 1: JSON format**

```javascript
{
  "user": "string",                    // Required - User ID (ObjectId)
  "pet": "string",                     // Required - Pet ID (ObjectId)
  "neutered": "string",                // Required - Neutered status ("Yes"/"No")
  "temperament": ["string"],           // Required - Array of temperament traits
  "socialize": "string",               // Required - Socialization preference ("Yes"/"No")
  "time": ["string"],                  // Required - Array of preferred times
  "location": "string",                // Required - Preferred location
  "size": "string",                    // Required - Preferred size
  "age": "string",                     // Required - Preferred age range
  "coordinates": {                     // Required - Location coordinates
    "latitude": "number",              // Required - Latitude
    "longitude": "number"              // Required - Longitude
  },
  "searchRadius": "number"             // Optional - Search radius in km (default: 10)
}
```

**Option 2: Form data format (supports multiple formats)**

```javascript
{
  "user": "string",                    // Required - User ID (ObjectId)
  "pet": "string",                     // Required - Pet ID (ObjectId)
  "neutered": "string",                // Required - Neutered status ("Yes"/"No")
  "socialize": "string",               // Required - Socialization preference ("Yes"/"No")
  "location": "string",                // Required - Preferred location
  "size": "string",                    // Required - Preferred size
  "age": "string",                     // Required - Preferred age range

  // Arrays can be sent as JSON strings or individual values:
  "temperament": '["friendly","playful","energetic"]',  // JSON string array
  "time": '["morning","evening"]',     // JSON string array

  // Coordinates can be sent as separate fields or JSON string:
  "coordinates[latitude]": "12.22",    // Separate fields (recommended for forms)
  "coordinates[longitude]": "34.44",
  // OR "coordinates": '{"latitude":12.22,"longitude":34.44}',

  "searchRadius": "10"                 // String number (auto-parsed to number)
}
```

#### Response

```javascript
{
  "success": true,
  "message": "Preferencias de dog match creadas/actualizadas correctamente",
  "data": {
    "_id": "string",
    "user": {
      "_id": "string",
      "firstname": "string",
      "lastname": "string",
      "phone": "string",
      "address": "string"
    },
    "pet": {
      "_id": "string",
      "pet_name": "string",
      "pet_gender": "string",
      "pet_color": "string",
      "pet_image": "string",
      "pet_race": "string"
    },
    "neutered": "string",
    "temperament": ["string"],
    "socialize": "string",
    "time": ["string"],
    "location": "string",
    "size": "string",
    "age": "string",
    "coordinates": {
      "latitude": "number",
      "longitude": "number"
    },
    "searchRadius": "number",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  },
  "matchingUsers": "number",           // Number of users that match
  "shouldSendNotifications": "boolean",
  "notificationType": "string",        // "new_preferences" or "updated_preferences"
  "notificationsSent": "number",
  "notificationResults": []
}
```

### 10. Get Dog Match Preferences by Pet ID

**POST** `/dogmatch/preferences/get`

Get dog match preferences for a specific pet.

#### Request Body

```javascript
{
  "petId": "string"                    // Required - Pet ID (ObjectId)
}
```

#### Response

```javascript
{
  "success": true,
  "message": "Preferencias de dog match obtenidas correctamente",
  "data": {
    "_id": "string",
    "user": {
      "_id": "string",
      "firstname": "string",
      "lastname": "string",
      "phone": "string",
      "address": "string"
    },
    "pet": {
      "_id": "string",
      "pet_name": "string",
      "pet_gender": "string",
      "pet_color": "string",
      "pet_image": "string",
      "pet_race": "string"
    },
    "neutered": "string",
    "temperament": ["string"],
    "socialize": "string",
    "time": ["string"],
    "location": "string",
    "size": "string",
    "age": "string",
    "coordinates": {
      "latitude": "number",
      "longitude": "number"
    },
    "searchRadius": "number",
    "isActive": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 11. Get All Dog Matches for Pet

**POST** `/dogmatch/preferences/all`

Get all matching dogs based on a pet's preferences within a specified radius.

#### Request Body

```javascript
{
  "petId": "string",                   // Required - Pet ID (ObjectId)
  "coordinates": {                     // Required - Current location coordinates
    "latitude": "number",              // Required - Current latitude
    "longitude": "number"              // Required - Current longitude
  },
  "radius": "number"                   // Optional - Search radius in km (default: 10)
}
```

#### Response

```javascript
{
  "success": true,
  "message": "Se encontraron X preferencias de dog match dentro de Xkm (ordenadas por similitud y distancia)",
  "preferences": [
    {
      "_id": "string",
      "user": {
        "_id": "string",
        "firstname": "string",
        "lastname": "string",
        "phone": "string",
        "address": "string"
      },
      "pet": {
        "_id": "string",
        "pet_name": "string",
        "pet_gender": "string",
        "pet_color": "string",
        "pet_image": "string",
        "pet_race": "string"
      },
      "neutered": "string",
      "temperament": ["string"],
      "socialize": "string",
      "time": ["string"],
      "location": "string",
      "size": "string",
      "age": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "searchRadius": "number",
      "isActive": "boolean",
      "createdAt": "string",
      "updatedAt": "string",
      "matchPercentage": "number",       // Match percentage (0-100)
      "distance": "number"               // Distance in km
    }
  ],
  "count": "number",                     // Number of matches found
  "searchRadius": "number",
  "petCoordinates": {
    "latitude": "number",
    "longitude": "number"
  },
  "debug": {
    "totalPreferencesChecked": "number",
    "preferencesWithCoordinates": "number",
    "preferencesWithoutCoordinates": "number"
  }
}
```

### 12. Deactivate Dog Match Preferences

**POST** `/dogmatch/preferences/deactivate`

Deactivate dog match preferences for a user (sets isActive to false).

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
  "message": "Preferencias de dog match desactivadas correctamente"
}
```

## Error Responses

### 400 Bad Request

```javascript
{
  "success": false,
  "message": "Missing required fields" // or specific validation error
}
```

### 404 Not Found

```javascript
{
  "success": false,
  "message": "Mascota no encontrada para este usuario" // or "No se encontraron preferencias..."
}
```

### 500 Internal Server Error

```javascript
{
  "success": false,
  "message": "Error en el servidor." // or specific error message
}
```

## Data Types

### Pet Object Fields

- `_id`: MongoDB ObjectId (string)
- `user`: User ObjectId reference (string) or populated user object
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
- `createdAt`: Creation timestamp (string)
- `updatedAt`: Last update timestamp (string)
- `qrCode`: QR code object (if available)
- `dogMatchPreferences`: Dog match preferences object (if available)

### Dog Match Preferences Object Fields

- `_id`: MongoDB ObjectId (string)
- `user`: User ObjectId reference (string) or populated user object
- `pet`: Pet ObjectId reference (string) or populated pet object
- `neutered`: Neutered status (string)
- `temperament`: Array of temperament traits (array of strings)
- `socialize`: Socialization preference (string)
- `time`: Array of preferred times (array of strings)
- `location`: Preferred location (string)
- `size`: Preferred size (string)
- `age`: Preferred age range (string)
- `coordinates`: Object with latitude and longitude (object)
- `searchRadius`: Search radius in kilometers (number)
- `isActive`: Whether preferences are active (boolean)
- `createdAt`: Creation timestamp (string)
- `updatedAt`: Last update timestamp (string)

### Additional Response Fields for Matches

- `matchPercentage`: Compatibility percentage (number, 0-100)
- `distance`: Distance between pets in km (number)

## Notes

- All image uploads are processed through Cloudinary
- File uploads must be sent as multipart/form-data
- User population includes: firstname, lastname, phone, address
- Pet population includes: pet_name, pet_gender, pet_color, pet_image, pet_race
- Dates should be in YYYY-MM-DD format
- All responses are in JSON format
- Error messages are primarily in Spanish
- Dog match preferences are automatically created when registering/updating pets if the required fields are provided
- When deleting a pet, all associated data (QR codes, dog match preferences, lost pet records) are automatically deleted
- Dog match results are sorted by match percentage (highest first) and then by distance (closest first)
- Coordinates are required for dog match functionality
- Match percentages are calculated based on multiple criteria compatibility

## Form Data Parsing Features

The backend includes intelligent form data parsing that automatically handles different data formats:

### Nested Objects

```javascript
// Frontend can send coordinates as:
coordinates[latitude]: "12.22"
coordinates[longitude]: "34.44"

// Backend automatically converts to:
coordinates: { latitude: 12.22, longitude: 34.44 }
```

### Array Handling

```javascript
// Arrays can be sent as:
temperament: '["friendly","playful"]'; // JSON string
temperament: "friendly"; // Single value → converted to ["friendly"]
temperament: ["friendly", "playful"]; // Native array (if supported by form)

// All are converted to proper arrays in the backend
```

### Number Conversion

```javascript
// String numbers are automatically converted:
searchRadius: "15"  →  searchRadius: 15
```

### Supported Endpoints

The following endpoints support advanced form data parsing:

- `POST /register_pet` - Pet registration with dog match preferences
- `PUT /:id` - Pet updates with dog match preferences
- `POST /dogmatch/preferences` - Dog match preference creation/updates

### Error Handling

- Invalid JSON strings in arrays are handled gracefully
- Missing coordinate fields are validated properly
- Single values for arrays are automatically converted to arrays
- Invalid numbers default to sensible fallbacks (e.g., searchRadius defaults to 10)

### Debugging

- All parsed form data is logged to console for debugging
- Original form data structure is preserved for fallback handling
- Clear error messages for validation failures
