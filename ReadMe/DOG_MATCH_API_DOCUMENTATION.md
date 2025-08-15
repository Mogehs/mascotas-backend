# Dog Match API Documentation

## Overview
The dog matching system allows users to set their preferences for dog matching and receive real-time notifications when new users join or update their preferences with matching criteria. The system also enables users to view all dogs that match their preferences.

## Flow Description

### 1. User Sets Dog Match Preferences
Users can create or update their dog matching preferences which include:
- `neutered`: Whether they prefer neutered dogs ("Yes"/"No")
- `temperament`: Array of preferred temperaments (e.g., ["Friendly", "Calm"])
- `socialize`: Socialization preference ("Yes"/"No")
- `time`: Array of preferred meeting times (e.g., ["Morning", "Evening"])
- `location`: Preferred location for meetings
- `size`: Preferred dog size ("Small", "Medium", "Large", "Todos")
- `age`: Preferred age range ("1-5 años", "6-10 años", etc.)

### 2. Real-time Notifications
When a user creates or updates dog match preferences, the system:
- Finds all users with matching preferences
- Sends push notifications to those users
- Includes detailed user information and preferences in the notification
- Navigates to `/dog-match` screen when notification is tapped

### 3. View Matched Dogs
Users can retrieve all dogs that match their saved preferences, excluding their own pets.

## API Endpoints

### 1. Create/Update Dog Match Preferences
**Endpoint:** `POST /api/pet/dogmatch/preferences`

**Request Body:**
```json
{
  "user": "userId",
  "neutered": "Yes",
  "temperament": ["Friendly", "Playful"],
  "socialize": "Yes",
  "time": ["Morning", "Afternoon"],
  "location": "Park Central",
  "size": "Medium",
  "age": "1-5 años"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferencias de dog match creadas correctamente",
  "data": {
    "_id": "dogMatchId",
    "user": { 
      "firstname": "John", 
      "lastname": "Doe", 
      "phone": "123456789",
      "address": "123 Main St"
    },
    "neutered": "Yes",
    "temperament": ["Friendly", "Playful"],
    "socialize": "Yes",
    "time": ["Morning", "Afternoon"],
    "location": "Park Central",
    "size": "Medium",
    "age": "1-5 años",
    "isActive": true,
    "createdAt": "2025-08-15T...",
    "updatedAt": "2025-08-15T..."
  },
  "matchingUsers": 5,
  "shouldSendNotifications": true,
  "notificationType": "new_preferences",
  "notificationsSent": 3,
  "notificationResults": [
    {
      "userId": "user1",
      "success": true,
      "result": {...}
    },
    {
      "userId": "user2",
      "success": true,
      "result": {...}
    }
  ]
}
```

**Features:**
- ✅ **Smart Change Detection**: Only sends notifications when preferences actually change
- ✅ **Real-time Notifications**: Automatically notifies matching users
- ✅ **Detailed Response**: Shows exactly how many notifications were sent
- ✅ **Error Handling**: API doesn't fail if notifications fail

### 2. Get User's Dog Match Preferences
**Endpoint:** `POST /api/pet/dogmatch/preferences/get`

**Request Body:**
```json
{
  "user": "userId"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferencias de dog match obtenidas correctamente",
  "data": {
    "_id": "dogMatchId",
    "user": { 
      "firstname": "John", 
      "lastname": "Doe",
      "phone": "123456789",
      "address": "123 Main St"
    },
    "neutered": "Yes",
    "temperament": ["Friendly", "Playful"],
    "socialize": "Yes",
    "time": ["Morning", "Afternoon"],
    "location": "Park Central",
    "size": "Medium",
    "age": "1-5 años",
    "isActive": true,
    "createdAt": "2025-08-15T...",
    "updatedAt": "2025-08-15T..."
  }
}
```

### 3. Get Matched Dogs Based on User Preferences
**Endpoint:** `POST /api/pet/dogmatch/matched-dogs`

**Request Body:**
```json
{
  "user": "userId"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Se encontraron mascotas que coinciden con tus preferencias",
  "matchedPets": [
    {
      "_id": "petId",
      "pet_name": "Buddy",
      "pet_gender": "Male",
      "pet_race": "Golden Retriever",
      "pet_image": "cloudinary_url",
      "pet_description": "Friendly and energetic dog",
      "isNeutered": "Yes",
      "temperament": ["Friendly"],
      "pet_socialize": "Yes",
      "preferred_time": ["Morning"],
      "preferred_location": "Park Central",
      "pet_size": "Medium",
      "preferred_age": "1-5 años",
      "user": {
        "firstname": "Jane",
        "lastname": "Smith",
        "phone": "987654321",
        "address": "456 Oak Street"
      },
      "createdAt": "2025-08-15T...",
      "updatedAt": "2025-08-15T..."
    }
  ],
  "count": 1
}
```

### 4. Deactivate Dog Match Preferences
**Endpoint:** `POST /api/pet/dogmatch/preferences/deactivate`

**Request Body:**
```json
{
  "user": "userId"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferencias de dog match desactivadas correctamente"
}
```

## Notification System

### Push Notification Types

#### 1. New User Joined
**Type:** `dog_match_new_user`
**Title:** "¡Nueva coincidencia en Dog Match!"
**Body:** "Juan Pérez se unió a Dog Match con preferencias similares a las tuyas."

#### 2. Preferences Updated
**Type:** `dog_match_preferences_updated`
**Title:** "¡Preferencias de Dog Match actualizadas!"
**Body:** "María García actualizó sus preferencias de Dog Match y siguen coincidiendo contigo."

### Notification Data Structure
```json
{
  "type": "dog_match_new_user",
  "category": "dog_match",
  "navigation_route": "/dog-match",
  "user_name": "Juan Pérez",
  "user_id": "userId",
  "dog_match_id": "dogMatchId",
  "match_preferences": {
    "neutered": "Yes",
    "temperament": ["Friendly", "Playful"],
    "socialize": "Yes",
    "time": ["Morning", "Afternoon"],
    "location": "Park Central",
    "size": "Medium",
    "age": "1-5 años"
  },
  "timestamp": "2025-08-15T10:30:00.000Z"
}
```

### Notification Triggers
- ✅ **New preferences created** - When a user creates dog match preferences for the first time
- ✅ **Preferences updated** - When a user changes any of their existing preferences
- ❌ **No change** - If user submits identical preferences, no notifications are sent

## Database Schema

### DogMatch Model
```javascript
{
  user: ObjectId (ref: "user", required),
  neutered: String (required),
  temperament: [String] (required),
  socialize: String (required),
  time: [String] (required),
  location: String (required),
  size: String (required),
  age: String (required),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Enhanced Pet Model Fields
The Pet model includes these fields for dog matching:
- `isNeutered`: String (default: "No")
- `temperament`: [String]
- `pet_socialize`: String (default: "No")
- `preferred_time`: [String]
- `preferred_location`: String (default: "N/A")
- `pet_size`: String (default: "Todos")
- `preferred_age`: String (default: "1-5 años")

## Usage Flow Examples

### Scenario 1: New User Creates Preferences
```
1. User A creates preferences:
   POST /api/pet/dogmatch/preferences
   {
     "user": "userA",
     "neutered": "Yes",
     "temperament": ["Friendly"],
     "socialize": "Yes",
     "time": ["Morning"],
     "location": "Central Park",
     "size": "Medium",
     "age": "1-5 años"
   }

2. System finds matching users (B, C, D)
3. Push notifications sent to users B, C, D
4. Response includes: matchingUsers: 3, notificationsSent: 3
```

### Scenario 2: User Updates Preferences
```
1. User A updates location:
   POST /api/pet/dogmatch/preferences
   {
     "user": "userA",
     "location": "Riverside Park",
     // ... other preferences
   }

2. System detects change in location
3. Finds new matching users (E, F)
4. Sends "preferences updated" notifications
5. Response includes: notificationType: "updated_preferences"
```

### Scenario 3: View Matched Dogs
```
1. User views their matches:
   POST /api/pet/dogmatch/matched-dogs
   { "user": "userA" }

2. System uses User A's saved preferences
3. Finds pets matching those criteria
4. Returns list of matching pets with owner info
```

## Error Handling

### HTTP Status Codes
- **200**: Success (preferences updated, matches found)
- **201**: Created (new preferences created)
- **404**: Not found (no preferences found, no matches)
- **500**: Server error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

## Integration Requirements

### Firebase Setup (for notifications)
```env
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_PROJECT_ID=your-project-id
```

### User Model Enhancement
Add FCM token field to User model:
```javascript
{
  fcmToken: String // Firebase Cloud Messaging token
}
```

## Advanced Features

### 1. Smart Matching Algorithm
- **Exact matches**: All criteria must match
- **Array intersection**: Temperament and time arrays use `$in` operator
- **Exclusion**: Users don't see their own pets in matches

### 2. Notification Optimization
- **Batch processing**: Multiple notifications sent efficiently
- **Error resilience**: Failed notifications don't break the API
- **Detailed logging**: Track notification success/failure rates

### 3. Performance Considerations
- **Indexed queries**: Database queries optimized for matching
- **Async processing**: Notifications sent asynchronously
- **Caching potential**: Results can be cached for frequent users

## Testing Examples

### Test New User Registration
```bash
curl -X POST http://localhost:3000/api/pet/dogmatch/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "user": "60f7d123456789abcdef1234",
    "neutered": "Yes",
    "temperament": ["Friendly", "Calm"],
    "socialize": "Yes",
    "time": ["Morning", "Evening"],
    "location": "Central Park",
    "size": "Large",
    "age": "2-7 años"
  }'
```

### Test Getting Matches
```bash
curl -X POST http://localhost:3000/api/pet/dogmatch/matched-dogs \
  -H "Content-Type: application/json" \
  -d '{
    "user": "60f7d123456789abcdef1234"
  }'
```

## Future Enhancements

### Planned Features
1. **Distance-based matching**: Add geolocation support
2. **Match scoring**: Implement compatibility scoring system
3. **Chat integration**: Direct messaging between matched users
4. **Photo verification**: Ensure pet photos are recent and accurate
5. **Meeting scheduler**: In-app meeting scheduling system
6. **Review system**: Rate and review playdates
7. **Group meetups**: Organize group dog meetups
8. **Breed-specific matching**: Enhanced breed compatibility

### Analytics Integration
- Track matching success rates
- Monitor notification engagement
- Analyze user behavior patterns
- Generate matching insights

## Security Considerations

### Data Privacy
- User contact information only shared after mutual interest
- Optional data fields for privacy control
- Ability to block/report users

### Validation
- Input sanitization for all preference fields
- User authentication required for all endpoints
- Rate limiting to prevent spam

This comprehensive dog match system provides a complete solution for connecting dog owners with similar preferences while maintaining user privacy and providing real-time engagement through notifications.
