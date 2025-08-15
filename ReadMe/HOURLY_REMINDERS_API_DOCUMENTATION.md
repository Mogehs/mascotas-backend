# Hour-Based Reminders API Documentation

This API allows you to set multiple reminder times throughout the day for treatments, medications, vaccines, and other medical procedures.

## Base URL

```
/api/hourly-reminders
```

## Overview

The hour-based reminders system allows you to:

- Set multiple reminder times per day for the same treatment
- Schedule reminders at specific hours (e.g., every 8 hours: 08:00, 16:00, 00:00)
- Manage reminders for different medical categories (treatments, medications, vaccines, etc.)
- Get, update, and delete existing reminder schedules

## Data Structure

### Reminder Times Format

```json
{
  "reminderTimes": [
    {
      "date": "2025-08-15",
      "times": ["08:00", "16:00", "00:00"]
    },
    {
      "date": "2025-08-16",
      "times": ["08:00", "16:00", "00:00"]
    }
  ]
}
```

## Endpoints

### 1. Add Treatment Reminder Times

**POST** `/treatment/add-reminder-times`

Add multiple reminder times for a treatment.

**Request Body:**

```json
{
  "medicalRecordId": "64a1b2c3d4e5f6789012345",
  "reminderTimes": [
    {
      "date": "2025-08-15",
      "times": ["08:00", "16:00", "00:00"]
    },
    {
      "date": "2025-08-16",
      "times": ["08:00", "16:00", "00:00"]
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Hourly reminders added successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "pet_treatment_reminder_times": [
      {
        "date": "2025-08-15",
        "times": ["08:00", "16:00", "00:00"]
      }
    ]
  }
}
```

### 2. Add Medication Reminder Times

**POST** `/medication/add-reminder-times`

Add multiple reminder times for medication/dose.

**Request Body:**

```json
{
  "medicalRecordId": "64a1b2c3d4e5f6789012345",
  "reminderTimes": [
    {
      "date": "2025-08-15",
      "times": ["07:00", "15:00", "23:00"]
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Hourly medication reminders added successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "dose_reminder_times": [
      {
        "date": "2025-08-15",
        "times": ["07:00", "15:00", "23:00"]
      }
    ]
  }
}
```

### 3. Add Vaccine Reminder Times

**POST** `/vaccine/add-reminder-times`

Add multiple reminder times for vaccines.

**Request Body:**

```json
{
  "medicalRecordId": "64a1b2c3d4e5f6789012345",
  "reminderTimes": [
    {
      "date": "2025-08-15",
      "times": ["09:00", "21:00"]
    }
  ]
}
```

### 4. Get Reminder Times

**GET** `/get-reminder-times/:medicalRecordId`

Retrieve all reminder times for a medical record.

**Response:**

```json
{
  "success": true,
  "message": "Reminder times retrieved successfully",
  "data": {
    "treatment": [
      {
        "date": "2025-08-15",
        "times": ["08:00", "16:00", "00:00"]
      }
    ],
    "medication": [
      {
        "date": "2025-08-15",
        "times": ["07:00", "15:00", "23:00"]
      }
    ],
    "vaccine": [],
    "deworming": [],
    "postOperation": [],
    "checkUp": []
  }
}
```

### 5. Update Treatment Reminder Times

**PUT** `/treatment/update-reminder-times`

Update existing reminder times for treatment.

**Request Body:**

```json
{
  "medicalRecordId": "64a1b2c3d4e5f6789012345",
  "reminderTimes": [
    {
      "date": "2025-08-15",
      "times": ["06:00", "14:00", "22:00"]
    }
  ]
}
```

### 6. Delete Reminder Times

**DELETE** `/delete-reminder-times/:medicalRecordId/:reminderType`

Delete all reminder times for a specific type.

**Parameters:**

- `medicalRecordId`: The ID of the medical record
- `reminderType`: One of: `treatment`, `medication`, `vaccine`, `deworming`, `postOperation`, `checkUp`

**Response:**

```json
{
  "success": true,
  "message": "Reminder times deleted successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345"
  }
}
```

## Example Use Cases

### 1. Antibiotic Treatment Every 8 Hours

```json
{
  "medicalRecordId": "64a1b2c3d4e5f6789012345",
  "reminderTimes": [
    {
      "date": "2025-08-15",
      "times": ["08:00", "16:00", "00:00"]
    },
    {
      "date": "2025-08-16",
      "times": ["08:00", "16:00", "00:00"]
    },
    {
      "date": "2025-08-17",
      "times": ["08:00", "16:00", "00:00"]
    }
  ]
}
```

### 2. Eye Drops Every 6 Hours

```json
{
  "medicalRecordId": "64a1b2c3d4e5f6789012345",
  "reminderTimes": [
    {
      "date": "2025-08-15",
      "times": ["06:00", "12:00", "18:00", "00:00"]
    }
  ]
}
```

### 3. Pain Medication Every 12 Hours

```json
{
  "medicalRecordId": "64a1b2c3d4e5f6789012345",
  "reminderTimes": [
    {
      "date": "2025-08-15",
      "times": ["08:00", "20:00"]
    }
  ]
}
```

## Integration with Existing System

The hour-based reminder system works alongside the existing single daily reminder system:

1. **Backward Compatibility**: Existing single reminder fields (`pet_treatment_remider_date`, `dose_reminder`, etc.) continue to work
2. **Priority**: If both single and multiple reminders are set, multiple reminders take priority
3. **Automatic Scheduling**: All reminders are automatically scheduled in the cron service
4. **Push Notifications**: Each reminder time triggers a separate push notification

## Error Handling

### Common Error Responses

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Medical record ID and reminder times are required"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Medical record not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

## Time Format

- **Date Format**: `YYYY-MM-DD` (e.g., "2025-08-15")
- **Time Format**: `HH:mm` in 24-hour format (e.g., "08:00", "16:30")
- **Timezone**: All times are processed in "America/Mexico_City" timezone

## Notifications

Each scheduled reminder will:

1. Send a push notification to the pet owner's device
2. Include pet name, reminder type, and scheduled time
3. Navigate to the medical history section when tapped
4. Be automatically removed from the schedule after execution

## Technical Notes

- Reminders are scheduled using node-cron
- Old reminders (>30 days) are automatically cleaned up weekly
- The system supports unlimited reminder times per day
- Each reminder is scheduled individually for maximum reliability
