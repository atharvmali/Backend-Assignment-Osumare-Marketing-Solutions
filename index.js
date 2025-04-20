const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const ejs = require("ejs");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = "task-api-secret-key"; // In production, use environment variables

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory storage for tasks and users
const tasks = [];
const users = [];
let nextId = 1;
let nextUserId = 1;

// Home route that renders the EJS template
app.get("/", (req, res) => {
  res.render("index", { title: "Task Manager" });
});

// Utility to find task by ID
const findTaskById = (id) => {
  return tasks.find((task) => task.id === id);
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Filter and sort tasks based on query parameters
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

// User Registration
app.post("/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Check if user already exists
    if (users.some((user) => user.username === username)) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: nextUserId++,
      username,
      password: hashedPassword,
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// User Login
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /tasks - Retrieve all tasks with pagination, filtering and sorting
app.get("/tasks", authenticateToken, (req, res) => {
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Apply filters and sorting
  const filteredAndSortedTasks = filterAndSortTasks(tasks, req.query);

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedTasks = filteredAndSortedTasks.slice(startIndex, endIndex);

  // Prepare pagination metadata
  const totalTasks = filteredAndSortedTasks.length;
  const totalPages = Math.ceil(totalTasks / limit);

  res.status(200).json({
    data: paginatedTasks,
    pagination: {
      total_items: totalTasks,
      total_pages: totalPages,
      current_page: page,
      items_per_page: limit,
      has_next_page: page < totalPages,
      has_prev_page: page > 1,
    },
  });
});

// GET /tasks/:id - Retrieve a specific task by ID
app.get("/tasks/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const task = findTaskById(id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.status(200).json(task);
});

// POST /tasks - Create a new task
app.post("/tasks", authenticateToken, (req, res) => {
  const { title, description } = req.body;

  // Validation
  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required" });
  }

  const newTask = {
    id: nextId++,
    title,
    description,
    completed: false,
    createdAt: new Date(),
    userId: req.user.id, // Associate task with the authenticated user
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id - Update an existing task
app.put("/tasks/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, completed } = req.body;
  const task = findTaskById(id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Check if user owns the task
  if (task.userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "You don't have permission to update this task" });
  }

  // Validation
  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required" });
  }

  // Update task
  task.title = title;
  task.description = description;
  task.completed = completed !== undefined ? completed : task.completed;
  task.updatedAt = new Date();

  res.status(200).json(task);
});

// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Check if user owns the task
  if (tasks[taskIndex].userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "You don't have permission to delete this task" });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.status(200).json(deletedTask);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Website is available at http://localhost:${PORT}`);
});
