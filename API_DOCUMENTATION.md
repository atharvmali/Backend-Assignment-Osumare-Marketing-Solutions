# Task Management API Documentation

## Overview

This REST API provides endpoints for managing tasks with user authentication, pagination, filtering, and sorting capabilities. The API uses JWT (JSON Web Tokens) for authentication and authorization. The application also includes server-side rendering using EJS templates.

## Base URL

Production:
```
https://backend-assignment-osumare-marketing.onrender.com
```

Local Development:
```
http://localhost:3000
```

## Frontend Routes

### Main Application Interface

Renders the main application interface using EJS templates.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Response**: HTML page rendered using EJS template

## Authentication

### Register a New User

Creates a new user account and returns an authentication token.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
  "username": "user123",
  "password": "password123"
}
```

- **Success Response**:
  - **Code**: 201 Created
  - **Content**:

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**: `{ "error": "Username and password are required" }` or `{ "error": "Username already exists" }`
  - **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Registration failed" }`

### Login

Authenticates a user and returns a token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
  "username": "user123",
  "password": "password123"
}
```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Error Response**:
  - **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Invalid credentials" }`
  - **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Login failed" }`

## Task Endpoints

All task endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get All Tasks

Retrieves a paginated list of tasks with optional filtering and sorting.

- **URL**: `/tasks`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - **Pagination**:
    - `page=[integer]` - Page number (default: 1)
    - `limit=[integer]` - Items per page (default: 10)
  - **Filtering**:
    - `completed=[boolean]` - Filter by completion status (true/false)
    - `title=[string]` - Filter tasks containing the specified text in title
  - **Sorting**:
    - `sortBy=[field]` - Field to sort by (e.g., title, createdAt)
    - `sortOrder=[order]` - Sort order (asc/desc, default: asc)

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the RESTful API project",
      "completed": false,
      "createdAt": "2023-04-01T12:00:00.000Z",
      "userId": 1
    },
    ...
  ],
  "pagination": {
    "total_items": 25,
    "total_pages": 3,
    "current_page": 1,
    "items_per_page": 10,
    "has_next_page": true,
    "has_prev_page": false
  }
}
```

- **Error Response**:
  - **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Unauthorized: No token provided" }`
  - **Code**: 403 Forbidden
  - **Content**: `{ "error": "Forbidden: Invalid token" }`

### Get Task by ID

Retrieves a specific task by ID.

- **URL**: `/tasks/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**: `id=[integer]`

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:

```json
{
  "id": 1,
  "title": "Complete project",
  "description": "Finish the RESTful API project",
  "completed": false,
  "createdAt": "2023-04-01T12:00:00.000Z",
  "userId": 1
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**: `{ "error": "Task not found" }`
  - **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Unauthorized: No token provided" }`
  - **Code**: 403 Forbidden
  - **Content**: `{ "error": "Forbidden: Invalid token" }`

### Create Task

Creates a new task for the authenticated user.

- **URL**: `/tasks`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:

```json
{
  "title": "Complete project",
  "description": "Finish the RESTful API project"
}
```

- **Success Response**:
  - **Code**: 201 Created
  - **Content**:

```json
{
  "id": 1,
  "title": "Complete project",
  "description": "Finish the RESTful API project",
  "completed": false,
  "createdAt": "2023-04-01T12:00:00.000Z",
  "userId": 1
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**: `{ "error": "Title and description are required" }`
  - **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Unauthorized: No token provided" }`
  - **Code**: 403 Forbidden
  - **Content**: `{ "error": "Forbidden: Invalid token" }`

### Update Task

Updates an existing task. Users can only update their own tasks.

- **URL**: `/tasks/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**: `id=[integer]`
- **Request Body**:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:

```json
{
  "id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "createdAt": "2023-04-01T12:00:00.000Z",
  "updatedAt": "2023-04-02T12:00:00.000Z",
  "userId": 1
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**: `{ "error": "Task not found" }`
  - **Code**: 400 Bad Request
  - **Content**: `{ "error": "Title and description are required" }`
  - **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Unauthorized: No token provided" }`
  - **Code**: 403 Forbidden
  - **Content**: `{ "error": "Forbidden: Invalid token" }` or `{ "error": "You don't have permission to update this task" }`

### Delete Task

Deletes a task. Users can only delete their own tasks.

- **URL**: `/tasks/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**: `id=[integer]`

- **Success Response**:
  - **Code**: 200 OK
  - **Content**: The deleted task object

```json
{
  "id": 1,
  "title": "Complete project",
  "description": "Finish the RESTful API project",
  "completed": false,
  "createdAt": "2023-04-01T12:00:00.000Z",
  "userId": 1
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**: `{ "error": "Task not found" }`
  - **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Unauthorized: No token provided" }`
  - **Code**: 403 Forbidden
  - **Content**: `{ "error": "Forbidden: Invalid token" }` or `{ "error": "You don't have permission to delete this task" }`

## Error Handling

The API returns appropriate HTTP status codes and error messages for different scenarios:

- `400` - Bad Request (missing required fields, validation errors)
- `401` - Unauthorized (missing or invalid authentication)
- `403` - Forbidden (valid authentication but insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server-side issues)

## API Testing Examples

### Using curl

For local testing, use `http://localhost:3000`. For production, use `https://backend-assignment-osumare-marketing.onrender.com`.

1. Register a new user:

```bash
curl -X POST https://backend-assignment-osumare-marketing.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user123","password":"password123"}'
```

2. Login:

```bash
curl -X POST https://backend-assignment-osumare-marketing.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user123","password":"password123"}'
```

3. Get all tasks with filtering and pagination:

```bash
curl -X GET 'https://backend-assignment-osumare-marketing.onrender.com/tasks?page=1&limit=5&completed=false&sortBy=createdAt&sortOrder=desc' \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

4. Create a new task:

```bash
curl -X POST https://backend-assignment-osumare-marketing.onrender.com/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"New Task","description":"This is a new task"}'
```

5. Update a task:

```bash
curl -X PUT https://backend-assignment-osumare-marketing.onrender.com/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Updated Task","description":"This is an updated task","completed":true}'
```

6. Delete a task:

```bash
curl -X DELETE https://backend-assignment-osumare-marketing.onrender.com/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
``` 