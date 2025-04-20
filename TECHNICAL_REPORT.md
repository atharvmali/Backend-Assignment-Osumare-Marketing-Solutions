# Technical Report: Task Management API

## Architecture Overview

The Task Management API is designed as a RESTful service built on Node.js and Express.js. The architecture follows a modular design with clear separation of concerns:

1. **API Layer**: Express.js routes handling HTTP requests and responses
2. **Presentation Layer**: EJS templates for server-side rendering
3. **Authentication Layer**: JWT-based authentication middleware
4. **Business Logic Layer**: Task and user management operations
5. **Data Storage Layer**: In-memory arrays for task and user storage

## Design Approach

### RESTful API Design

The API adheres to RESTful principles:

- **Resource-Based URLs**: `/tasks` and `/auth` endpoints represent clear resources
- **Appropriate HTTP Methods**: GET, POST, PUT, DELETE for CRUD operations
- **Stateless Communication**: Each request contains all information needed for processing
- **Standard Status Codes**: 200, 201, 400, 401, 403, 404, 500 for different scenarios
- **JSON Responses**: Consistent JSON format for all responses

### Server-Side Rendering

The application uses EJS (Embedded JavaScript) for server-side rendering:

1. **Template-Based Views**: EJS templates in the `views` directory
2. **Dynamic Content Rendering**: Server processes templates before sending to client
3. **Data Passing**: Variables passed from routes to templates
4. **Separation of Concerns**: 
   - Routes handle data retrieval
   - Templates handle presentation
   - Static assets (CSS/JS) handle client-side behavior

### Authentication and Security

A token-based authentication system was implemented for security:

1. **JWT Authentication**: JSON Web Tokens provide stateless authentication
2. **Password Encryption**: bcryptjs for secure password hashing
   - Salt rounds: 10 (industry standard for balance of security/performance)
   - Async hashing for non-blocking operation
3. **Token Verification Middleware**: Protects routes from unauthorized access
4. **Owner-Based Authorization**: Users can only modify their own tasks

### Data Structure Choices

#### In-Memory Data Storage

The API uses JavaScript arrays for data storage:

```javascript
const tasks = [];
const users = [];
```

#### Task Structure

Each task is modeled as a JavaScript object with properties:

```javascript
{
  id: number,
  title: string,
  description: string,
  completed: boolean,
  createdAt: Date,
  updatedAt: Date (optional),
  userId: number
}
```

This structure allows for:
- Easy filtering by various properties
- Efficient sorting on different fields
- Straightforward serialization to JSON

### Algorithm Implementations

#### Task Filtering and Sorting

The `filterAndSortTasks` function implements efficient filtering and sorting:

```javascript
const filterAndSortTasks = (tasksArray, query) => {
  let result = [...tasksArray];

  // Apply filters
  if (query.completed !== undefined) {
    const isCompleted = query.completed === "true";
    result = result.filter((task) => task.completed === isCompleted);
  }

  if (query.title) {
    result = result.filter((task) =>
      task.title.toLowerCase().includes(query.title.toLowerCase())
    );
  }

  // Apply sorting
  if (query.sortBy) {
    const sortField = query.sortBy;
    const sortOrder =
      query.sortOrder && query.sortOrder.toLowerCase() === "desc" ? -1 : 1;

    result.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });
  }

  return result;
};
```

**Time complexity analysis:**
- Filtering: O(n) where n is the number of tasks
- Sorting: O(n log n) using JavaScript's native sort algorithm
- Overall: O(n log n) dominated by the sorting operation

#### Pagination Implementation

The pagination algorithm:

```javascript
// Apply pagination
const startIndex = (page - 1) * limit;
const endIndex = page * limit;
const paginatedTasks = filteredAndSortedTasks.slice(startIndex, endIndex);

// Prepare pagination metadata
const totalTasks = filteredAndSortedTasks.length;
const totalPages = Math.ceil(totalTasks / limit);
```

**Time complexity**: O(1) for the pagination operation itself, though it depends on the preceding operations.

### Error Handling Approach

A comprehensive error handling strategy was implemented:

1. **Route-Specific Error Handling**: Each endpoint handles specific error cases
2. **Global Error Middleware**: Catches unhandled errors
3. **404 Handler**: Manages undefined routes
4. **Try-Catch Blocks**: Around asynchronous operations

This multi-layered approach ensures:
- Descriptive error messages for client troubleshooting
- Appropriate status codes for client applications
- Protection against unhandled exceptions

## Performance Considerations

### Optimization Techniques

1. **Efficient Data Filtering**: Using native JavaScript array methods for filtering
2. **Pagination**: Limiting response size to improve performance
3. **Index-Based Retrieval**: Using array indices for O(1) lookups where possible
4. **Server-Side Rendering**: Reduces initial page load time by sending pre-rendered HTML

### Scalability Limitations

The current implementation has several scalability limitations:

1. **In-Memory Storage**: Data is lost on server restart and limited by available memory
2. **Single Server Architecture**: No distribution or load balancing
3. **Synchronous Operations**: Some operations could block the event loop
4. **Template Rendering**: Server-side rendering increases server CPU usage compared to pure API responses
