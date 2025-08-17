# Dog Match API Documentation

## Overview
The Dog Match API allows users to create preferences for finding compatible dogs for their pets, manage these preferences, and get matched dogs based on compatibility criteria.

## Base URL
All endpoints are prefixed with `/api/pet`

## Models

### DogMatch Schema
```javascript
{
  user: ObjectId (ref: "user") - Required
  pet: ObjectId (ref: "petprofiles") - Required  
  neutered: String - Required
  temperament: [String] - Required
  socialize: String - Required
  time: [String] - Required
  location: String - Required
  size: String - Required
  age: String - Required
  isActive: Boolean - Default: true
  createdAt: Date
  updatedAt: Date
}
```

## Endpoints

### 1. Find Dog Matches
**POST** `/match`

Finds dogs that match the specified criteria.

#### Request Body
```json
{
  "neutered": "string",
  "temperament": ["string"],
  "socialize": "string", 
  "time": ["string"],
  "location": "string",
  "size": "string",
  "age": "string"
}
```

#### Response
**Success (200)**
```json
{
  "success": true,
  "message": "Se encontraron perros que coinciden con los filtros.",
  "matchedDogs": [
    {
      "_id": "string",
      "pet_name": "string",
      "isNeutered": "string",
      "temperament": ["string"],
      "pet_socialize": "string",
      "pet_size": "string",
      "preferred_age": "string",
      "preferred_time": ["string"],
      "preferred_location": "string",
      "user": {
        "firstname": "string",
        "lastname": "string", 
        "phone": "string",
        "address": "string"
      }
    }
  ]
}
```

**Not Found (404)**
```json
{
  "success": false,
  "message": "No se encontraron perros que coincidan con los filtros."
}
```

**Error (500)**
```json
{
  "success": false,
  "message": "error message"
}
```

### 2. Create/Update Dog Match Preferences
**POST** `/dogmatch/preferences`

Creates new dog match preferences or updates existing ones for a user.

#### Request Body
```json
{
  "user": "ObjectId",
  "pet": "ObjectId", 
  "neutered": "string",
  "temperament": ["string"],
  "socialize": "string",
  "time": ["string"],
  "location": "string",
  "size": "string",
  "age": "string"
}
```

#### Response
**Success (201/200)**
```json
{
  "success": true,
  "message": "Preferencias de dog match creadas/actualizadas correctamente",
  "data": {
    "_id": "string",
    "user": {
      "firstname": "string",
      "lastname": "string",
      "phone": "string", 
      "address": "string"
    },
    "pet": {
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
    "isActive": true,
    "createdAt": "date",
    "updatedAt": "date"
  },
  "matchingUsers": "number",
  "shouldSendNotifications": "boolean",
  "notificationType": "new_preferences|updated_preferences",
  "notificationsSent": "number",
  "notificationResults": []
}
```

**Error (500)**
```json
{
  "success": false,
  "message": "error message"
}
```

### 3. Get User's Dog Match Preferences
**POST** `/dogmatch/preferences/get`

Retrieves the current dog match preferences for a specific user.

#### Request Body
```json
{
  "user": "ObjectId"
}
```

#### Response
**Success (200)**
```json
{
  "success": true,
  "message": "Preferencias de dog match obtenidas correctamente",
  "data": {
    "_id": "string",
    "user": {
      "firstname": "string",
      "lastname": "string",
      "phone": "string",
      "address": "string"
    },
    "pet": {
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
    "isActive": true,
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Not Found (404)**
```json
{
  "success": false,
  "message": "No se encontraron preferencias de dog match para este usuario"
}
```

**Error (500)**
```json
{
  "success": false,
  "message": "error message"
}
```

### 4. Get All Dog Match Preferences
**POST** `/dogmatch/preferences/all`

Retrieves all dog match preferences from all users.

#### Request Body
```json
{}
```

#### Response
**Success (200)**
```json
{
  "success": true,
  "message": "Se obtuvieron todas las preferencias de dog match",
  "preferences": [
    {
      "_id": "string",
      "user": {
        "firstname": "string",
        "lastname": "string",
        "phone": "string",
        "address": "string"
      },
      "pet": {
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
      "isActive": true,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "count": "number"
}
```

**Not Found (404)**
```json
{
  "success": false,
  "message": "No hay preferencias de dog match guardadas"
}
```

**Error (500)**
```json
{
  "success": false,
  "message": "error message"
}
```

### 5. Deactivate Dog Match Preferences
**POST** `/dogmatch/preferences/deactivate`

Deactivates the dog match preferences for a specific user.

#### Request Body
```json
{
  "user": "ObjectId"
}
```

#### Response
**Success (200)**
```json
{
  "success": true,
  "message": "Preferencias de dog match desactivadas correctamente"
}
```

**Not Found (404)**
```json
{
  "success": false,
  "message": "No se encontraron preferencias de dog match para este usuario"
}
```

**Error (500)**
```json
{
  "success": false,
  "message": "error message"
}
```

## Features

### Automatic Notifications
When new dog match preferences are created or updated, the system automatically:
1. Finds other users with matching preferences
2. Sends push notifications to those users
3. Returns notification results in the response

### Matching Algorithm
The matching algorithm considers the following criteria:
- **Neutered status**: Must match exactly
- **Temperament**: At least one temperament must match
- **Socialization level**: Must match exactly  
- **Available time**: At least one time slot must match
- **Location**: Must match exactly
- **Size preference**: Must match exactly
- **Age preference**: Must match exactly

### Data Population
All responses include populated user and pet data for easy display in the frontend.

## Error Handling
All endpoints include comprehensive error handling with appropriate HTTP status codes and descriptive error messages in Spanish.
