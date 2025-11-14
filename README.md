# 🐾 Mascotas Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

**A comprehensive backend solution for pet management, business services, and community features**

[Features](#-features) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Database](#-database-schema) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Real-time Features](#-real-time-features)
- [Subscription Plans](#-subscription-plans)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Mascotas Backend** is a robust Node.js/Express API that powers a comprehensive pet management ecosystem. It provides features for pet owners, businesses, and administrators to manage pets, track lost animals, connect with services, and build a thriving pet community.

### Key Highlights

- 🏥 **Complete Pet Management** - Track medical history, vaccinations, and care schedules
- 🏢 **Business Integration** - Connect pet owners with local pet services and stores
- 🔍 **Lost & Found System** - Help reunite lost pets with their owners
- 💬 **Real-time Chat** - WebSocket-based messaging for instant communication
- 📍 **Location Services** - Find nearby pet businesses and services
- 🎯 **Smart Matching** - Dog breeding match recommendations
- 🏷️ **QR Code Tags** - Generate and manage pet identification tags
- 📊 **Analytics Dashboard** - Comprehensive business and user analytics
- 🔔 **Push Notifications** - Real-time updates via Firebase Cloud Messaging
- 💳 **Subscription Management** - Flexible business subscription plans

---

## ✨ Features

### 👤 User Management

- User registration and authentication with JWT
- Profile management with Cloudinary image uploads
- Device token management for push notifications
- Multi-language support
- Badge subscription system

### 🐕 Pet Management

- Complete pet profile creation and management
- Medical history tracking
- Vaccination records
- Multiple pets per user
- Pet image uploads

### 🏷️ QR Code System

- Generate unique QR codes for pet identification
- QR code activation and assignment
- Lost pet recovery via QR scanning
- Tag management and tracking

### 🆘 Lost Pet System

- Report lost pets with location data
- Browse lost pet reports
- Real-time notifications for matches
- Location-based search

### 🏢 Business Services

- Business profile registration
- PetPro subscription plans (Premium)
- Location-based business discovery
- Featured ads and promotions
- Product showcase
- Analytics and insights
- Operating hours management

### 💬 Real-time Chat

- WebSocket-based messaging
- One-on-one conversations
- Message history
- Typing indicators
- Read receipts

### 🎯 Dog Match

- Dog breeding match recommendations
- Profile-based matching algorithm
- Filter by breed, size, and location

### 📊 Analytics

- User growth tracking
- Sales analytics
- Business performance metrics
- Subscription statistics
- Revenue tracking

### 👨‍💼 Super Admin Features

- User management (block/unblock)
- Business management
- Subscription control
- Push notification broadcasts
- Complete user/business deletion
- System-wide analytics

---

## 🛠️ Tech Stack

### Core Technologies

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Real-time:** Socket.io
- **Authentication:** JWT (JSON Web Tokens)

### Cloud Services

- **File Storage:** Cloudinary
- **Push Notifications:** Firebase Cloud Messaging (FCM)

### Additional Libraries

- **express-fileupload** - File upload handling
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment configuration
- **node-cron** - Scheduled tasks

---

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository

```bash
git clone https://github.com/Mogehs/mascotas-backend.git
cd mascotas-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory (see [Environment Variables](#-environment-variables))

### Step 4: Start MongoDB

```bash
# Make sure MongoDB is running on your system
mongod
```

### Step 5: Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT)

---

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mascotas
# OR use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mascotas

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Configuration
CLOUDINARY_APP_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Firebase Cloud Messaging
FCM_SERVER_KEY=your_fcm_server_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Socket.io
SOCKET_PORT=3001
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Main API Routes

#### 🔐 Authentication & Users

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| POST   | `/user/register`     | Register new user      |
| POST   | `/user/login`        | User login             |
| GET    | `/user/profile`      | Get user profile       |
| PUT    | `/user/update`       | Update user profile    |
| POST   | `/user/upload-image` | Upload profile picture |

#### 🐾 Pet Management

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| POST   | `/pet/create`        | Create pet profile |
| GET    | `/pet/user/:userId`  | Get user's pets    |
| GET    | `/pet/:petId`        | Get pet details    |
| PUT    | `/pet/update/:petId` | Update pet info    |
| DELETE | `/pet/delete/:petId` | Delete pet         |

#### 🏷️ QR Code Management

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| POST   | `/qrcode/generate`     | Generate QR code    |
| GET    | `/qrcode/:qrId`        | Get QR code details |
| POST   | `/qrcode/activate`     | Activate QR code    |
| GET    | `/qrcode/user/:userId` | Get user's QR codes |

#### 🆘 Lost Pet System

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| POST   | `/lost/report`         | Report lost pet      |
| GET    | `/lost/all`            | Get all lost pets    |
| GET    | `/lost/:lostId`        | Get lost pet details |
| PUT    | `/lost/found/:lostId`  | Mark pet as found    |
| DELETE | `/lost/delete/:lostId` | Delete lost report   |

#### 🏢 Business Services

| Method | Endpoint                        | Description                  |
| ------ | ------------------------------- | ---------------------------- |
| POST   | `/business/register`            | Register business            |
| GET    | `/business/:business_id`        | Get business details         |
| GET    | `/business/user/:user_id`       | Get user's business          |
| POST   | `/business/updateBusiness`      | Update business              |
| GET    | `/business/map-business/nearby` | Find nearby businesses       |
| POST   | `/business/petpro/activate`     | Activate PetPro subscription |
| DELETE | `/business/delete/:businessId`  | Delete business completely   |

#### 📢 Ads & Promotions

| Method | Endpoint                    | Description          |
| ------ | --------------------------- | -------------------- |
| POST   | `/ads/create`               | Create advertisement |
| GET    | `/ads/all`                  | Get all ads          |
| GET    | `/ads/business/:businessId` | Get business ads     |
| PUT    | `/ads/update/:adId`         | Update ad            |
| DELETE | `/ads/delete/:adId`         | Delete ad            |

#### 🛍️ Products

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| POST   | `/product/create`            | Create product      |
| GET    | `/product/all`               | Get all products    |
| GET    | `/product/:productId`        | Get product details |
| PUT    | `/product/update/:productId` | Update product      |
| DELETE | `/product/delete/:productId` | Delete product      |

#### 💬 Chat & Messaging

| Method | Endpoint                         | Description               |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/chat/conversations/:userId`    | Get user conversations    |
| GET    | `/chat/messages/:conversationId` | Get conversation messages |
| POST   | `/chat/send`                     | Send message              |

#### 🎯 Dog Match

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| POST   | `/dogmatch/create`          | Create match profile      |
| GET    | `/dogmatch/matches/:userId` | Get match recommendations |
| PUT    | `/dogmatch/update/:matchId` | Update match profile      |

#### 👨‍💼 Super Admin

| Method | Endpoint                             | Description                  |
| ------ | ------------------------------------ | ---------------------------- |
| GET    | `/superadmin/users`                  | Get all users with analytics |
| GET    | `/superadmin/businesses`             | Get all businesses           |
| POST   | `/superadmin/toggle-user-status`     | Block/unblock user           |
| POST   | `/superadmin/toggle-business-status` | Block/unblock business       |
| POST   | `/superadmin/send-notification`      | Broadcast notification       |
| GET    | `/superadmin/analytics/users`        | Get user analytics           |
| GET    | `/superadmin/analytics/sales`        | Get sales analytics          |
| DELETE | `/superadmin/user/:userId`           | Delete user completely       |

For detailed API documentation, see the [ReadMe](./ReadMe) folder containing comprehensive guides for each module.

---

## 🗄️ Database Schema

### Core Models

#### User Model

```javascript
{
  firstname,
    lastname,
    username,
    email,
    phone,
    password(hashed),
    profilePicture,
    device_token,
    language,
    company_registered,
    business_subscription,
    badge_subscription,
    badge_name,
    role(user / super_admin),
    is_blocked,
    createdAt,
    updatedAt;
}
```

#### Pet Model

```javascript
{
  user (ref), name, species, breed, gender,
  age, weight, color, microchip_id,
  medical_history, vaccinations, images[],
  createdAt, updatedAt
}
```

#### Business Model

```javascript
{
  id (user ref), company_name, company_type,
  company_description, company_logo,
  physical_address, latitude, longitude, location (GeoJSON),
  phone, email, website, branches[],
  operation_timing[], tax_identification_number,
  petpro_subscription: {
    is_active, subscription_type, start_date, end_date,
    payment_status, amount_paid, payment_method
  },
  features: {
    can_create_featured_ads, max_featured_ads,
    can_showcase_products, max_products,
    can_create_promotions, max_promotions,
    analytics_access
  },
  statistics, is_blocked,
  createdAt, updatedAt
}
```

#### QRCode Model

```javascript
{
  qr_text,
    userId(ref),
    petId(ref),
    isActive,
    scans,
    lastScanned,
    createdAt,
    updatedAt;
}
```

#### Lost Pet Model

```javascript
{
  user (ref), pet (ref), description,
  location, latitude, longitude,
  contact_info, status (lost/found),
  images[], found_date,
  createdAt, updatedAt
}
```

---

## 🔄 Real-time Features

### Socket.io Events

#### Connection

```javascript
socket.on("connection", (socket) => {
  // User connected
});
```

#### Chat Events

- `join_chat` - Join a conversation
- `send_message` - Send a message
- `receive_message` - Receive a message
- `typing` - User typing indicator
- `stop_typing` - Stop typing indicator

#### Notification Events

- `new_notification` - Real-time notifications
- `lost_pet_alert` - Lost pet alerts
- `business_update` - Business updates

---

## 💳 Subscription Plans

### PetPro Business Subscription

#### Premium Plan - $49/year

- ✅ Unlimited featured ads
- ✅ Unlimited product showcase
- ✅ Unlimited promotions
- ✅ Advanced analytics dashboard
- ✅ Priority support
- ✅ Map visibility
- ✅ Customer messaging

#### Features Matrix

| Feature          | Free  | Premium        |
| ---------------- | ----- | -------------- |
| Featured Ads     | ❌    | ✅ Unlimited   |
| Product Showcase | ❌    | ✅ Unlimited   |
| Promotions       | ❌    | ✅ Unlimited   |
| Analytics        | ❌    | ✅ Full Access |
| Map Listing      | ❌    | ✅ Yes         |
| Support          | Basic | Priority       |

---

## 🔒 Security

### Authentication & Authorization

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (User/Super Admin)
- Token expiration and refresh

### Data Protection

- Input validation and sanitization
- MongoDB injection prevention
- CORS configuration
- Rate limiting (recommended for production)
- Environment variable protection

### Best Practices Implemented

- Secure password storage
- Token-based session management
- Blocked user access prevention
- Admin-only protected routes

---

## 📱 Push Notifications

The system supports Firebase Cloud Messaging (FCM) for push notifications:

### Notification Types

- `ADMIN_NOTIFICATION` - Administrative broadcasts
- `LOST_PET_ALERT` - Lost pet notifications
- `BUSINESS_UPDATE` - Business-related updates
- `CHAT_MESSAGE` - New message alerts
- `SUBSCRIPTION_UPDATE` - Subscription changes
- `DELETE_USER` - Account deletion notices

### Implementation

```javascript
await sendGeneralNotification(
  deviceToken,
  title,
  message,
  notificationType,
  extraData
);
```

---

## 🔧 Scheduled Tasks

### Cron Jobs

- **Subscription Expiration Check** - Daily at 12:01 AM
  - Automatically expires premium subscriptions
  - Reverts businesses to free plan
  - Disables premium features

```javascript
cron.schedule("1 0 * * *", expireSubscriptionsHelper);
```

---

## 📊 Admin Dashboard Features

### User Analytics

- Total users count
- Active users (last 30 days)
- Monthly registration trends
- Subscription rates
- User growth metrics

### Sales Analytics

- QR code statistics
- PetPro subscription revenue
- Order analytics
- Monthly sales trends
- Total revenue tracking

### Management Tools

- User blocking/unblocking
- Business approval/blocking
- Subscription management
- Manual badge assignment
- Broadcast notifications

---

## 🌐 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

---

## 📁 Project Structure

```
mascotas-backend/
├── config/
│   ├── cloudinary.js      # Cloudinary configuration
│   ├── multer.js           # File upload middleware
│   ├── server.js           # Server initialization
│   └── socket.js           # Socket.io setup
├── controller/
│   ├── ads.js              # Ads controller
│   ├── ai.js               # AI features
│   ├── analytics.js        # Analytics logic
│   ├── business.js         # Business management
│   ├── chat.js             # Chat functionality
│   ├── lost.js             # Lost pet handling
│   ├── pet.js              # Pet management
│   ├── user.js             # User operations
│   └── superadmin.js       # Admin functions
├── middleware/
│   ├── jwt.js              # JWT authentication
│   └── subscription.js     # Subscription checks
├── model/
│   ├── user.js             # User schema
│   ├── pet.js              # Pet schema
│   ├── business.js         # Business schema
│   ├── qrcode.js           # QR code schema
│   ├── lost.js             # Lost pet schema
│   └── ...                 # Other models
├── routes/
│   ├── user.js             # User routes
│   ├── pet.js              # Pet routes
│   ├── business.js         # Business routes
│   └── ...                 # Other routes
├── service/
│   ├── ai.service.js       # AI service integration
│   ├── cron.service.js     # Scheduled tasks
│   └── notification.service.js # Push notifications
├── ReadMe/                  # Detailed API docs
├── db.js                    # Database connection
├── index.js                 # Application entry point
├── package.json             # Dependencies
└── .env                     # Environment variables
```

---

## 🚦 Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 500  | Internal Server Error |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**

   ```bash
   git clone https://github.com/Mogehs/mascotas-backend.git
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**

   ```bash
   git commit -m 'Add some amazing feature'
   ```

4. **Push to the branch**

   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Coding Standards

- Follow existing code style
- Add comments for complex logic
- Update documentation for API changes
- Write meaningful commit messages

---

## 📝 Changelog

### Version 1.0.0 (Current)

- ✅ Complete user and pet management system
- ✅ Business registration and subscription
- ✅ QR code generation and tracking
- ✅ Lost pet reporting system
- ✅ Real-time chat with Socket.io
- ✅ Push notifications via FCM
- ✅ Admin dashboard and analytics
- ✅ Location-based business discovery
- ✅ Dog match recommendations
- ✅ Automated subscription management

---

## 🐛 Known Issues

- [ ] Rate limiting not implemented (recommended for production)
- [ ] Unit tests need to be added
- [ ] API documentation could be more detailed
- [ ] WebSocket reconnection handling could be improved

---

## 🎯 Roadmap

- [ ] Add comprehensive unit and integration tests
- [ ] Implement rate limiting and request throttling
- [ ] Add Redis for caching
- [ ] Implement email notifications
- [ ] Add two-factor authentication
- [ ] Create GraphQL API option
- [ ] Add API versioning
- [ ] Implement advanced search with Elasticsearch
- [ ] Add video upload support
- [ ] Create mobile SDK

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Mogehs**

- GitHub: [@Mogehs](https://github.com/Mogehs)

---

## 🙏 Acknowledgments

- Express.js community
- MongoDB team
- Socket.io contributors
- Cloudinary platform
- All open-source libraries used in this project

---

## 📞 Support

For support and queries:

- 📧 Email: support@mascotas.com
- 🐛 Issues: [GitHub Issues](https://github.com/Mogehs/mascotas-backend/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Mogehs/mascotas-backend/discussions)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for pet lovers everywhere 🐾

</div>
