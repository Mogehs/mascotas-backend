# Super Admin Subscription Management API Documentation

This document provides detailed information about the Super Admin APIs for managing user badge subscriptions and business PetPro subscriptions.

## Table of Contents

1. [Badge Subscription Management](#badge-subscription-management)
2. [Business Subscription Management](#business-subscription-management)
3. [Error Handling](#error-handling)
4. [Flutter Integration Examples](#flutter-integration-examples)

---

## Badge Subscription Management

### Update User Badge Subscription

Toggle or update a user's badge subscription status and badge name.

**Endpoint:** `POST /api/superadmin/update_badge`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <super_admin_token>
```

**Request Body:**

```json
{
  "userId": "string (required)",
  "isActive": "boolean (required)",
  "badgeName": "string (optional)"
}
```

**Request Parameters:**

- `userId` (string, required): The MongoDB ObjectId of the user
- `isActive` (boolean, required): `true` to activate, `false` to deactivate badge subscription
- `badgeName` (string, optional): Badge name to assign (only used when activating)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "_id": "64f0c9a5a1b2c3d4e5f67890",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "city": "Sample City",
    "postalcode": "12345",
    "state": "Sample State",
    "role": "user",
    "business_subscription": false,
    "badge_subscription": true,
    "badge_name": "Premium Member",
    "device_token": "device_token_here",
    "company_registered": false,
    "is_loggedin": false,
    "is_blocked": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing required fields
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

**Example Requests:**

**Activate Badge Subscription:**

```json
{
  "userId": "64f0c9a5a1b2c3d4e5f67890",
  "isActive": true,
  "badgeName": "Premium Member"
}
```

**Deactivate Badge Subscription:**

```json
{
  "userId": "64f0c9a5a1b2c3d4e5f67890",
  "isActive": false
}
```

**Behavior Notes:**

- When `isActive` is `true`: Sets `badge_subscription` to `true` and optionally updates `badge_name`
- When `isActive` is `false`: Sets `badge_subscription` to `false` and clears `badge_name`
- Sends push notification to user (if device_token exists)
- Accepts string values like "true"/"false" and numbers 1/0 for `isActive`

---

## Business Subscription Management

### Toggle Business PetPro Subscription

Activate or deactivate a business's PetPro subscription with all associated premium features.

**Endpoint:** `POST /api/superadmin/toggle_business_subscription`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <super_admin_token>
```

**Request Body:**

```json
{
  "businessId": "string (required)",
  "isActive": "boolean (required)"
}
```

**Request Parameters:**

- `businessId` (string, required): The MongoDB ObjectId of the business profile
- `isActive` (boolean, required): `true` to activate, `false` to deactivate subscription

**Success Response (200):**

```json
{
  "success": true,
  "message": "Business subscription activated successfully",
  "data": {
    "businessId": "64f0c9a5a1b2c3d4e5f67890",
    "is_active": true,
    "payment_status": "paid",
    "subscription_type": "premium",
    "features_enabled": true
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing required fields
- `404 Not Found`: Business profile not found
- `500 Internal Server Error`: Server error

**Example Requests:**

**Activate Business Subscription:**

```json
{
  "businessId": "64f0c9a5a1b2c3d4e5f67890",
  "isActive": true
}
```

**Deactivate Business Subscription:**

```json
{
  "businessId": "64f0c9a5a1b2c3d4e5f67890",
  "isActive": false
}
```

**Features Affected:**

**When Activated (`isActive: true`):**

- `petpro_subscription.is_active`: `true`
- `petpro_subscription.payment_status`: `"paid"`
- `petpro_subscription.subscription_type`: `"premium"`
- `features.can_create_featured_ads`: `true` (max: 10)
- `features.can_showcase_products`: `true` (max: 50)
- `features.can_create_promotions`: `true` (max: 5)
- `features.analytics_access`: `true`

**When Deactivated (`isActive: false`):**

- `petpro_subscription.is_active`: `false`
- `petpro_subscription.payment_status`: `"cancelled"`
- `petpro_subscription.subscription_type`: `"none"`
- All features set to `false` and limits to `0`

**Behavior Notes:**

- Sends push notification to business owner (if device_token exists)
- Updates all premium features simultaneously
- Accepts string values like "true"/"false" and numbers 1/0 for `isActive`

---

## Error Handling

### Common Error Responses

**400 Bad Request:**

```json
{
  "success": false,
  "message": "userId and isActive are required in the request body"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "User not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Database connection error"
}
```

---

## Flutter Integration Examples

### 1. Badge Subscription Service

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class BadgeSubscriptionService {
  static const String baseUrl = 'https://your-api-domain.com/api/superadmin';

  static Future<Map<String, dynamic>> updateBadgeSubscription({
    required String userId,
    required bool isActive,
    String? badgeName,
    required String token,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/update_badge'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'userId': userId,
          'isActive': isActive,
          if (badgeName != null) 'badgeName': badgeName,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
          'user': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Unknown error occurred',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }
}

// Usage Example:
Future<void> toggleUserBadge(String userId, bool activate) async {
  final result = await BadgeSubscriptionService.updateBadgeSubscription(
    userId: userId,
    isActive: activate,
    badgeName: activate ? 'Premium Member' : null,
    token: 'your_admin_token_here',
  );

  if (result['success']) {
    print('Badge updated successfully: ${result['message']}');
    // Update UI accordingly
  } else {
    print('Error: ${result['message']}');
    // Show error message to user
  }
}
```

### 2. Business Subscription Service

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class BusinessSubscriptionService {
  static const String baseUrl = 'https://your-api-domain.com/api/superadmin';

  static Future<Map<String, dynamic>> toggleBusinessSubscription({
    required String businessId,
    required bool isActive,
    required String token,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/toggle_business_subscription'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'businessId': businessId,
          'isActive': isActive,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
          'subscriptionData': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Unknown error occurred',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }
}

// Usage Example:
Future<void> toggleBusinessSubscription(String businessId, bool activate) async {
  final result = await BusinessSubscriptionService.toggleBusinessSubscription(
    businessId: businessId,
    isActive: activate,
    token: 'your_admin_token_here',
  );

  if (result['success']) {
    print('Business subscription updated: ${result['message']}');
    final subscriptionData = result['subscriptionData'];
    print('Status: ${subscriptionData['is_active']}');
    print('Payment Status: ${subscriptionData['payment_status']}');
    // Update UI accordingly
  } else {
    print('Error: ${result['message']}');
    // Show error message to user
  }
}
```

### 3. Complete Admin Panel Widget Example

```dart
import 'package:flutter/material.dart';

class AdminSubscriptionPanel extends StatefulWidget {
  final String userId;
  final String businessId;
  final String adminToken;

  const AdminSubscriptionPanel({
    Key? key,
    required this.userId,
    required this.businessId,
    required this.adminToken,
  }) : super(key: key);

  @override
  _AdminSubscriptionPanelState createState() => _AdminSubscriptionPanelState();
}

class _AdminSubscriptionPanelState extends State<AdminSubscriptionPanel> {
  bool _isLoadingBadge = false;
  bool _isLoadingBusiness = false;
  final TextEditingController _badgeNameController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Subscription Management',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            SizedBox(height: 20),

            // Badge Subscription Section
            Text(
              'Badge Subscription',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: 10),
            TextField(
              controller: _badgeNameController,
              decoration: InputDecoration(
                labelText: 'Badge Name (optional)',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isLoadingBadge
                        ? null
                        : () => _toggleBadgeSubscription(true),
                    icon: _isLoadingBadge
                        ? SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Icon(Icons.star),
                    label: Text('Activate Badge'),
                  ),
                ),
                SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isLoadingBadge
                        ? null
                        : () => _toggleBadgeSubscription(false),
                    icon: Icon(Icons.star_border),
                    label: Text('Deactivate Badge'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                    ),
                  ),
                ),
              ],
            ),

            SizedBox(height: 30),

            // Business Subscription Section
            Text(
              'Business Subscription',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isLoadingBusiness
                        ? null
                        : () => _toggleBusinessSubscription(true),
                    icon: _isLoadingBusiness
                        ? SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Icon(Icons.business),
                    label: Text('Activate Business'),
                  ),
                ),
                SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isLoadingBusiness
                        ? null
                        : () => _toggleBusinessSubscription(false),
                    icon: Icon(Icons.business_center),
                    label: Text('Deactivate Business'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _toggleBadgeSubscription(bool activate) async {
    setState(() => _isLoadingBadge = true);

    try {
      final result = await BadgeSubscriptionService.updateBadgeSubscription(
        userId: widget.userId,
        isActive: activate,
        badgeName: activate && _badgeNameController.text.isNotEmpty
            ? _badgeNameController.text
            : null,
        token: widget.adminToken,
      );

      _showSnackBar(result['message'], result['success']);

      if (result['success'] && !activate) {
        _badgeNameController.clear();
      }
    } finally {
      setState(() => _isLoadingBadge = false);
    }
  }

  Future<void> _toggleBusinessSubscription(bool activate) async {
    setState(() => _isLoadingBusiness = true);

    try {
      final result = await BusinessSubscriptionService.toggleBusinessSubscription(
        businessId: widget.businessId,
        isActive: activate,
        token: widget.adminToken,
      );

      _showSnackBar(result['message'], result['success']);
    } finally {
      setState(() => _isLoadingBusiness = false);
    }
  }

  void _showSnackBar(String message, bool isSuccess) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isSuccess ? Colors.green : Colors.red,
        duration: Duration(seconds: 3),
      ),
    );
  }

  @override
  void dispose() {
    _badgeNameController.dispose();
    super.dispose();
  }
}
```

### 4. Error Handling Best Practices

```dart
class ApiErrorHandler {
  static void handleError(BuildContext context, Map<String, dynamic> result) {
    if (!result['success']) {
      final message = result['message'] ?? 'An unknown error occurred';

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Error'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('OK'),
            ),
          ],
        ),
      );
    }
  }
}
```

---

## Testing

### Test Endpoints with cURL

**Test Badge Subscription:**

```bash
# Activate badge
curl -X POST "https://your-api-domain.com/api/superadmin/update_badge" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "64f0c9a5a1b2c3d4e5f67890",
    "isActive": true,
    "badgeName": "Premium Member"
  }'

# Deactivate badge
curl -X POST "https://your-api-domain.com/api/superadmin/update_badge" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "64f0c9a5a1b2c3d4e5f67890",
    "isActive": false
  }'
```

**Test Business Subscription:**

```bash
# Activate business subscription
curl -X POST "https://your-api-domain.com/api/superadmin/toggle_business_subscription" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "businessId": "64f0c9a5a1b2c3d4e5f67890",
    "isActive": true
  }'

# Deactivate business subscription
curl -X POST "https://your-api-domain.com/api/superadmin/toggle_business_subscription" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "businessId": "64f0c9a5a1b2c3d4e5f67890",
    "isActive": false
  }'
```

---

## Notes for Flutter Developer

1. **Authentication**: All requests require a valid super admin token in the Authorization header
2. **Error Handling**: Always check the `success` field in the response before processing data
3. **Loading States**: Implement loading indicators for better UX during API calls
4. **Validation**: Validate user inputs before sending requests
5. **Notifications**: Both APIs send push notifications to affected users automatically
6. **Boolean Flexibility**: The APIs accept various boolean formats (true/false, "true"/"false", 1/0)

For any questions or issues, please contact the backend development team.
