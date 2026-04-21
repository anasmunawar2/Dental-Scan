# DentalScan Architecture Guide

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── scan/
│   │   │   └── upload/
│   │   │       └── route.ts        # Scan upload endpoints
│   │   ├── notifications/
│   │   │   └── route.ts            # Notification management endpoints
│   │   ├── health/
│   │   │   └── route.ts            # Health check endpoint
│   │   ├── messaging/
│   │   │   └── route.ts            # Messaging endpoints
│   │   └── notify/
│   │       └── route.ts            # Legacy notification endpoint (deprecated)
│   ├── scanning/                   # Client pages
│   └── layout.tsx
│
├── lib/
│   ├── prisma.ts                   # Prisma singleton client
│   └── logger.ts                   # Logging utility
│
├── services/
│   ├── notification.service.ts     # Notification business logic
│   └── scan.service.ts             # Scan business logic
│
├── repositories/
│   └── notification.repo.ts        # Database access for notifications
│
├── types/
│   └── notification.ts             # TypeScript type definitions
│
└── utils/
    └── asyncHandler.ts             # Error handling wrapper for async routes
```

## 🏗️ Architectural Layers

### 1. **API Routes** (`app/api/**`)
**Responsibility**: Request/Response handling only

- Validate incoming requests
- Call services with validated data
- Handle response formatting
- Catch and return errors

**Rules**:
- ❌ No direct Prisma calls
- ❌ No business logic
- ✅ Delegate to services

### 2. **Services** (`services/**`)
**Responsibility**: Business logic & orchestration

- Implement workflows (e.g., scan creation → notification trigger)
- Orchestrate repositories and utilities
- Handle non-blocking operations (fire-and-forget)
- Validate domain constraints

**Rules**:
- ✅ Can call repositories
- ✅ Can call other services
- ❌ No direct HTTP responses
- ✅ Pure business logic

### 3. **Repositories** (`repositories/**`)
**Responsibility**: Database access only

- Query/write to database using Prisma
- Map database models to DTOs
- Handle database errors

**Rules**:
- ✅ Only Prisma calls
- ❌ No business logic
- ❌ No HTTP concerns

### 4. **Lib** (`lib/**`)
**Responsibility**: Shared utilities

- Prisma client singleton
- Logger utility
- Any other cross-cutting concerns

## 🔄 Request Flow Example: Scan Upload

```
POST /api/scan/upload
│
├─→ API Route validates request
│
├─→ Calls ScanService.uploadScan()
│   │
│   ├─→ Creates Scan via Prisma
│   │
│   ├─→ Triggers background notification (fire-and-forget)
│   │   │
│   │   ├─→ NotificationService.createNotification()
│   │   │   │
│   │   │   └─→ NotificationRepository.create()
│   │   │       └─→ Database INSERT
│   │   │
│   │   └─→ Continues without blocking
│   │
│   └─→ Returns scan data immediately
│
└─→ API sends 201 response with scan data
```

**Key**: The notification is created in the background without blocking the API response (non-blocking/fire-and-forget pattern).

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns: `{ status: "healthy", timestamp: "..." }`

### Scan Upload
```
POST /api/scan/upload
Content-Type: application/json

{
  "images": ["base64_image_1", "base64_image_2"],
  "status": "pending" (optional)
}
```

Returns: `{ success: true, scan: { ... }, message: "..." }`

Automatically triggers notification asynchronously.

### Get Scan
```
GET /api/scan/upload?scanId=<id>
```

Returns: `{ scan: { ... } }`

### List Notifications
```
GET /api/notifications?limit=50
```

Returns: `{ notifications: [...], unreadCount: 5 }`

### Update Notification
```
PATCH /api/notifications
Content-Type: application/json

{
  "action": "markAsRead" | "markAllAsRead" | "delete",
  "notificationId": "<id>" (required for markAsRead/delete)
}
```

Returns: `{ success: true, notification: { ... } }` or `{ success: true, count: 5 }`

### Messaging
```
GET /api/messaging?threadId=<id>
```
Returns: `{ messages: [...] }`

```
POST /api/messaging
Content-Type: application/json

{
  "threadId": "<id>",
  "content": "Message text",
  "sender": "patient" | "dentist"
}
```

Returns: `{ ok: true, message: { ... } }`

## 🔐 Error Handling

All API routes use the `asyncHandler` wrapper for consistent error handling:

```typescript
export const GET = asyncHandler(async (req: NextRequest) => {
  // Your code here
  // Errors are automatically caught and formatted
});
```

Errors are logged via the `logger` utility:
- `logger.info()` - General information
- `logger.warn()` - Warnings
- `logger.error()` - Errors with stack traces
- `logger.debug()` - Debug info (dev only)

## 🚀 Non-Blocking Notifications

When a scan is created:

1. Scan record saved to database
2. API response sent immediately (201)
3. Notification triggered asynchronously in background
4. If notification creation fails, it's logged but doesn't affect API response

This ensures scan upload is always fast, regardless of notification system latency.

## 💾 Prisma Client

The singleton pattern prevents connection pool exhaustion:

```typescript
import { prisma } from "@/lib/prisma";

const user = await prisma.user.findUnique({ where: { id: "..." } });
```

## 🧪 Testing Guidelines

### Unit Testing Services
- Mock repository layer
- Test business logic in isolation
- Verify workflows

### Integration Testing APIs
- Use real database (test environment)
- Verify request/response format
- Test error cases

### Testing Non-Blocking Behavior
- Verify scan creation returns immediately
- Verify notification created within reasonable time
- Verify failures don't block scan response

## 📦 Dependencies

- `@prisma/client`: ^5.12.1 - ORM
- `next`: 14.2.0 - Framework
- `typescript`: ^5 - Type safety

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/dentalscan
NODE_ENV=development|production
```

## 📝 Key Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **DRY**: No logic duplication across layers
3. **SOLID**: Follow SOLID principles
4. **Type Safety**: Full TypeScript coverage
5. **Error Handling**: Consistent error handling throughout
6. **Performance**: Non-blocking operations where appropriate
7. **Maintainability**: Clear code structure for future developers

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-20
