# API Documentation

## Overview

The DentalScan API follows RESTful principles with a clean, layered architecture. All endpoints are protected by proper error handling and logging.

## Base URL

```
http://localhost:3000/api
```

---

## Health Check

### `GET /health`

Check API health status.

**Response** (200):
```json
{
  "status": "healthy",
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

---

## Scan Management

### `POST /scan/upload`

Upload dental scan images. Automatically triggers a notification asynchronously.

**Request**:
```json
{
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ],
  "status": "pending"
}
```

**Parameters**:
- `images` (required): Array of base64-encoded images
- `status` (optional): Scan status. Default: "pending"

**Response** (201):
```json
{
  "success": true,
  "scan": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "status": "pending",
    "images": "data:image/jpeg;base64,...,data:image/jpeg;base64,...",
    "createdAt": "2026-04-20T10:30:00.000Z",
    "updatedAt": "2026-04-20T10:30:00.000Z"
  },
  "message": "Scan uploaded successfully. Notification triggered."
}
```

**Errors**:
- `400`: Missing or invalid images array
- `500`: Server error

---

### `GET /scan/upload`

Retrieve a specific scan by ID.

**Query Parameters**:
- `scanId` (required): The scan ID to retrieve

**Request**:
```
GET /scan/upload?scanId=clx1a2b3c4d5e6f7g8h9i0j1k
```

**Response** (200):
```json
{
  "scan": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "status": "pending",
    "images": "data:image/jpeg;base64,...",
    "createdAt": "2026-04-20T10:30:00.000Z",
    "updatedAt": "2026-04-20T10:30:00.000Z"
  }
}
```

**Errors**:
- `400`: Missing scanId parameter
- `404`: Scan not found
- `500`: Server error

---

## Notifications

### `GET /notifications`

Fetch all notifications with unread count.

**Query Parameters**:
- `limit` (optional): Maximum number of notifications to return. Default: 50

**Request**:
```
GET /notifications?limit=10
```

**Response** (200):
```json
{
  "notifications": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
      "scanId": "clx1a2b3c4d5e6f7g8h9i0j1k",
      "type": "scan_completed",
      "message": "Your dental scan has been processed successfully!",
      "isRead": false,
      "createdAt": "2026-04-20T10:30:00.000Z"
    }
  ],
  "unreadCount": 3
}
```

**Errors**:
- `500`: Server error

---

### `PATCH /notifications`

Update notification state (mark as read, delete, etc.).

**Request**:
```json
{
  "action": "markAsRead",
  "notificationId": "clx1a2b3c4d5e6f7g8h9i0j1k"
}
```

**Actions**:
- `markAsRead`: Mark a specific notification as read (requires `notificationId`)
- `markAllAsRead`: Mark all notifications as read
- `delete`: Delete a specific notification (requires `notificationId`)

**Response** (200):

For `markAsRead`:
```json
{
  "success": true,
  "notification": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "scanId": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "type": "scan_completed",
    "message": "Your dental scan has been processed successfully!",
    "isRead": true,
    "createdAt": "2026-04-20T10:30:00.000Z"
  }
}
```

For `markAllAsRead`:
```json
{
  "success": true,
  "count": 5
}
```

For `delete`:
```json
{
  "success": true
}
```

**Errors**:
- `400`: Invalid action or missing required parameters
- `500`: Server error

---

## Messaging

### `GET /messaging`

Retrieve message history for a specific thread.

**Query Parameters**:
- `threadId` (required): The thread ID

**Request**:
```
GET /messaging?threadId=clx1a2b3c4d5e6f7g8h9i0j1k
```

**Response** (200):
```json
{
  "messages": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
      "threadId": "clx1a2b3c4d5e6f7g8h9i0j1k",
      "content": "Hello doctor, I have a question about my teeth.",
      "sender": "patient",
      "createdAt": "2026-04-20T10:30:00.000Z"
    },
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
      "threadId": "clx1a2b3c4d5e6f7g8h9i0j1k",
      "content": "Hi! I'd be happy to help.",
      "sender": "dentist",
      "createdAt": "2026-04-20T10:32:00.000Z"
    }
  ]
}
```

**Errors**:
- `400`: Missing threadId parameter
- `500`: Server error

---

### `POST /messaging`

Save a new message to a thread.

**Request**:
```json
{
  "threadId": "clx1a2b3c4d5e6f7g8h9i0j1k",
  "content": "I have a question about my scan results.",
  "sender": "patient"
}
```

**Parameters**:
- `threadId` (required): The thread ID
- `content` (required): Message text
- `sender` (required): Either "patient" or "dentist"

**Response** (201):
```json
{
  "ok": true,
  "message": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "threadId": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "content": "I have a question about my scan results.",
    "sender": "patient",
    "createdAt": "2026-04-20T10:35:00.000Z"
  }
}
```

**Errors**:
- `400`: Missing required parameters
- `404`: Thread not found
- `500`: Server error

---

## Legacy Endpoints (Deprecated)

### `POST /notify` ⚠️

**Deprecated**: Use `POST /scan/upload` instead, which automatically triggers notifications.

Creates a notification for a scan completion.

**Request**:
```json
{
  "scanId": "clx1a2b3c4d5e6f7g8h9i0j1k",
  "status": "completed"
}
```

**Response** (200):
```json
{
  "ok": true,
  "message": "Notification triggered"
}
```

---

## Error Responses

All endpoints return consistent error responses:

**Generic Error** (500):
```json
{
  "error": "Internal Server Error"
}
```

**Validation Error** (400):
```json
{
  "error": "Images array is required and must not be empty"
}
```

**Not Found** (404):
```json
{
  "error": "Scan not found"
}
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. Future versions may include:
- Per-IP rate limiting
- Per-user rate limiting
- Adaptive rate limiting based on load

---

## Authentication

Currently no authentication is required. Future versions will implement:
- JWT tokens
- OAuth 2.0 integration
- Role-based access control

---

## Versioning

API Version: `1.0.0`

Future versions will be available at:
- `/api/v2/...`
- `/api/v3/...`

---

## Examples

### cURL

```bash
# Get health status
curl -X GET http://localhost:3000/api/health

# Upload scan
curl -X POST http://localhost:3000/api/scan/upload \
  -H "Content-Type: application/json" \
  -d '{"images":["data:image/jpeg;base64,..."]}'

# Get notifications
curl -X GET "http://localhost:3000/api/notifications?limit=10"

# Mark notification as read
curl -X PATCH http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"action":"markAsRead","notificationId":"clx1a2b3c4d5e6f7g8h9i0j1k"}'
```

### JavaScript/Fetch

```javascript
// Upload scan
const response = await fetch('/api/scan/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    images: ['data:image/jpeg;base64,...'],
    status: 'pending'
  })
});

const data = await response.json();
console.log(data.scan.id);
```

---

**Last Updated**: 2026-04-20
