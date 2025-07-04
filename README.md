# Mascotas Backend

A Node.js backend API for pet management with real-time chat, AI assistance, and notification services.

## Project Structure

```
mascotas-backend/
├── config/
│   ├── cloudinary.js         # Cloudinary configuration
│   ├── multer.js             # File upload configuration
│   ├── server.js             # Server middleware configuration
│   └── socket.js             # Socket.IO configuration
├── controller/
│   ├── ai.js                 # AI assistant controllers
│   ├── ads.js                # Advertisement controllers
│   ├── business.js           # Business controllers
│   ├── chat.js               # Chat controllers
│   ├── language.js           # Language controllers
│   ├── lost.js               # Lost pet controllers
│   ├── medicalhistory.js     # Medical history controllers
│   ├── order.js              # Order controllers
│   ├── pet.js                # Pet controllers
│   └── user.js               # User controllers
├── middleware/
│   └── jwt.js                # JWT authentication middleware
├── model/
│   ├── ads.js                # Advertisement model
│   ├── business.js           # Business model
│   ├── language.js           # Language model
│   ├── lost.js               # Lost pet model
│   ├── medicalhistory.js     # Medical history model
│   ├── message.js            # Chat message model
│   ├── order.js              # Order model
│   ├── pet.js                # Pet model
│   └── user.js               # User model
├── route/
│   ├── ads.js                # Advertisement routes
│   ├── ai.js                 # AI assistant routes
│   ├── business.js           # Business routes
│   ├── chat.js               # Chat routes
│   ├── language.js           # Language routes
│   ├── lost.js               # Lost pet routes
│   ├── medicalhistory.js     # Medical history routes
│   ├── order.js              # Order routes
│   ├── pet.js                # Pet routes
│   └── user.js               # User routes
├── service/
│   ├── ai.service.js         # AI service integration
│   ├── cron.service.js       # Scheduled tasks service
│   └── notification.service.js # Push notification service
├── tmp/                      # Temporary files
├── .env.example              # Environment variables template
├── db.js                     # Database connection
├── index.js                  # Main application entry point
└── package.json              # Dependencies and scripts
```

## Features

- **Pet Management**: CRUD operations for pets and their medical history
- **Real-time Chat**: Socket.IO powered messaging system
- **AI Assistant**: Veterinary and training advice using OpenRouter AI
- **Push Notifications**: Firebase Cloud Messaging for reminders
- **File Upload**: Cloudinary integration for image storage
- **Scheduled Tasks**: Cron jobs for automated notifications
- **Authentication**: JWT-based user authentication

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your environment variables
4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Pets

- `GET /api/pet/` - Get all pets
- `POST /api/pet/` - Create a new pet
- `PUT /api/pet/:id` - Update a pet
- `DELETE /api/pet/:id` - Delete a pet

### AI Assistant

- `POST /api/ai/veterinary` - Get veterinary advice
- `POST /api/ai/trainer` - Get training advice

### Chat

- `GET /api/chat/chatHistory/:senderId/:receiverId` - Get chat history

### Medical History

- `GET /api/medical/` - Get medical records
- `POST /api/medical/` - Create medical record

### Other Endpoints

- `GET /` - API health check
- `GET /render-health` - Backend health check

## Environment Variables

See `.env.example` for required environment variables.

## Services

### AI Service

Integrates with OpenRouter AI for veterinary and training advice.

### Notification Service

Handles Firebase Cloud Messaging for push notifications.

### Cron Service

Manages scheduled tasks for medication and vaccine reminders.

## Socket.IO Events

- `userLoggedIn` - Register user for real-time messaging
- `sendMessage` - Send a message to another user
- `receiveMessage` - Receive a message from another user

## License

MIT
