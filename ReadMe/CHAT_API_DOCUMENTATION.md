# Chat API Documentation

## Overview
The Chat API provides real-time messaging functionality between users, including REST endpoints for retrieving chat history and WebSocket events for real-time communication.

## Base URL
REST endpoints are prefixed with `/api/chat`
WebSocket connection is established at the server root

## Models

### Message Schema
```javascript
{
  senderId: String - Required
  receiverId: String - Required
  message: String - Required
  timestamp: Date - Required (Default: Date.now)
}
```

## REST API Endpoints

### 1. Get Chat History
**GET** `/chatHistory/:senderId/:receiverId`

Retrieves the complete chat history between two users.

#### Parameters
- `senderId`: String - ID of the first user
- `receiverId`: String - ID of the second user

#### Response
**Success (200)**
```json
[
  {
    "_id": "string",
    "senderId": "string",
    "receiverId": "string", 
    "message": "string",
    "timestamp": "date"
  }
]
```

**Error (500)**
```json
{
  "error": "Failed to fetch messages"
}
```

#### Notes
- Messages are sorted by timestamp in descending order (newest first)
- Returns all messages between the two users regardless of who sent them
- Uses MongoDB `$or` operator to find messages in both directions

## WebSocket Events

### Connection
Users connect to the WebSocket server and can emit/listen to the following events:

### 1. User Login Event
**Event**: `userLoggedIn`

Registers a user as online and maps their user ID to their socket ID.

#### Payload
```javascript
"userId" // String - The user's unique identifier
```

#### Usage
```javascript
socket.emit('userLoggedIn', userId);
```

### 2. Send Message Event
**Event**: `sendMessage`

Sends a message from one user to another in real-time.

#### Payload
```json
{
  "senderId": "string",
  "receiverId": "string",
  "message": "string", 
  "timestamp": "date"
}
```

#### Usage
```javascript
socket.emit('sendMessage', {
  senderId: 'user123',
  receiverId: 'user456',
  message: 'Hello there!',
  timestamp: new Date()
});
```

#### Server Behavior
1. Saves the message to the database
2. Looks up the receiver's socket ID
3. If receiver is online, emits `receiveMessage` event to them
4. If receiver is offline, message is still saved but not delivered in real-time

### 3. Receive Message Event
**Event**: `receiveMessage`

Automatically emitted to the receiver when a message is sent to them.

#### Payload
```json
{
  "senderId": "string",
  "receiverId": "string",
  "message": "string",
  "timestamp": "date"
}
```

#### Usage
```javascript
socket.on('receiveMessage', (data) => {
  console.log('New message received:', data);
  // Handle incoming message in UI
});
```

### 4. Disconnect Event
**Event**: `disconnect`

Automatically triggered when a user disconnects from the WebSocket.

#### Server Behavior
- Logs the disconnection
- Removes the user from the active users mapping

## Implementation Details

### User Management
- Active users are stored in a simple object: `{userId: socketId}`
- When a user logs in, their mapping is created/updated
- When a user disconnects, they're removed from active users

### Message Persistence
- All messages are automatically saved to the MongoDB database
- Messages are saved regardless of whether the receiver is online
- Offline users will see messages when they retrieve chat history

### Real-time Delivery
- Messages are only delivered in real-time if the receiver is currently connected
- If receiver is offline, they'll get the message when they next fetch chat history
- Server logs delivery status for debugging

## Error Handling

### REST API Errors
- Database connection issues return 500 status
- Invalid parameters are handled gracefully
- All errors include descriptive messages

### WebSocket Error Handling
- Failed message saves are logged but don't crash the connection
- Offline users don't cause errors when trying to deliver messages
- Connection drops are handled automatically

## Usage Examples

### Frontend Implementation
```javascript
// Connect to WebSocket
const socket = io('your-server-url');

// Register user as online
socket.emit('userLoggedIn', currentUserId);

// Send a message
const sendMessage = (receiverId, messageText) => {
  const messageData = {
    senderId: currentUserId,
    receiverId: receiverId,
    message: messageText,
    timestamp: new Date()
  };
  socket.emit('sendMessage', messageData);
};

// Listen for incoming messages
socket.on('receiveMessage', (messageData) => {
  displayMessage(messageData);
});

// Fetch chat history when opening a conversation
const loadChatHistory = async (userId1, userId2) => {
  const response = await fetch(`/api/chat/chatHistory/${userId1}/${userId2}`);
  const messages = await response.json();
  return messages;
};
```

## CORS Configuration
The WebSocket server is configured to accept connections from any origin with GET and POST methods enabled.

## Database Considerations
- Messages are stored permanently unless explicitly deleted
- Consider implementing message cleanup policies for old conversations
- Index on senderId and receiverId for optimal query performance
- Timestamp indexing recommended for sorting operations
