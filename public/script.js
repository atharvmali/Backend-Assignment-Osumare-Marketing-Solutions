// DOM Elements
const authSection = document.getElementById("auth-section");
const tasksSection = document.getElementById("tasks-section");
const userInfo = document.getElementById("user-info");
const usernameDisplay = document.getElementById("username-display");
const logoutBtn = document.getElementById("logout-btn");
const loginForm = document.getElementById("login-form-elem");
const registerForm = document.getElementById("register-form-elem");
const loginError = document.getElementById("login-error");
const registerError = document.getElementById("register-error");
const taskList = document.getElementById("task-list");
const addTaskBtn = document.getElementById("add-task-btn");
const taskFormContainer = document.getElementById("task-form-container");
const taskForm = document.getElementById("task-form");
const cancelTaskBtn = document.getElementById("cancel-task");
const editModal = document.getElementById("edit-modal");
const editTaskForm = document.getElementById("edit-task-form");
const closeModal = document.querySelector(".close-modal");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const filterStatus = document.getElementById("filter-status");
const sortBy = document.getElementById("sort-by");
const sortOrder = document.getElementById("sort-order");
const applyFiltersBtn = document.getElementById("apply-filters");
const authTabs = document.querySelectorAll(".auth-tab");
const authForms = document.querySelectorAll(".auth-form");

// State variables
let token = localStorage.getItem("token");
let username = localStorage.getItem("username");
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
  page: 1,
  limit: 5,
  title: "",
  completed: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

// Initialize the app
function init() {
  if (token) {
    showTasksSection();
    fetchTasks();
  } else {
    showAuthSection();
  }

  // Setup event listeners
  setupEventListeners();
}

// Setup all event listeners
function setupEventListeners() {
  // Auth tab switching
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      authForms.forEach((f) => f.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // Login form
  loginForm.addEventListener("submit", handleLogin);

  // Register form
  registerForm.addEventListener("submit", handleRegister);

  // Logout
  logoutBtn.addEventListener("click", handleLogout);

  // Add task button
  addTaskBtn.addEventListener("click", () => {
    taskFormContainer.classList.remove("hidden");
  });

  // Cancel add task
  cancelTaskBtn.addEventListener("click", () => {
    taskForm.reset();
    taskFormContainer.classList.add("hidden");
  });

  // Submit new task
  taskForm.addEventListener("submit", handleAddTask);

  // Edit task form
  editTaskForm.addEventListener("submit", handleUpdateTask);

  // Close modal
  closeModal.addEventListener("click", () => {
    editModal.classList.add("hidden");
  });

  // Pagination
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      currentFilters.page = currentPage;
      fetchTasks();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      currentFilters.page = currentPage;
      fetchTasks();
    }
  });

  // Search and filters
  searchBtn.addEventListener("click", () => {
    currentFilters.title = searchInput.value;
    currentFilters.page = 1;
    currentPage = 1;
    fetchTasks();
  });

  applyFiltersBtn.addEventListener("click", () => {
    currentFilters.completed = filterStatus.value;
    currentFilters.sortBy = sortBy.value;
    currentFilters.sortOrder = sortOrder.value;
    currentFilters.page = 1;
    currentPage = 1;
    fetchTasks();
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === editModal) {
      editModal.classList.add("hidden");
    }
  });
}

// API calls
async function makeRequest(url, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Something went wrong");
    }

    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Handle user login
async function handleLogin(e) {
  e.preventDefault();
  loginError.textContent = "";

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await makeRequest("/auth/login", "POST", {
      username,
      password,
    });

    // Save token and username
    token = response.token;
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);

    // Update UI
    usernameDisplay.textContent = username;
    loginForm.reset();
    showTasksSection();
    fetchTasks();
  } catch (error) {
    loginError.textContent =
      error.message || "Login failed. Please check your credentials.";
  }
}

// Handle user registration
async function handleRegister(e) {
  e.preventDefault();
  registerError.textContent = "";

  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  try {
    const response = await makeRequest("/auth/register", "POST", {
      username,
      password,
    });

    // Save token and username
    token = response.token;
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);

    // Update UI
    usernameDisplay.textContent = username;
    registerForm.reset();
    showTasksSection();
    fetchTasks();
  } catch (error) {
    registerError.textContent =
      error.message || "Registration failed. Please try a different username.";
  }
}

// Handle user logout
function handleLogout() {
  // Clear token and user info
  token = null;
  localStorage.removeItem("token");
  localStorage.removeItem("username");

  // Reset forms
  loginForm.reset();
  registerForm.reset();
  loginError.textContent = "";
  registerError.textContent = "";

  // Switch to auth section
  showAuthSection();
}

// Fetch tasks from API
async function fetchTasks() {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    for (const key in currentFilters) {
      if (currentFilters[key]) {
        queryParams.append(key, currentFilters[key]);
      }
    }

    const response = await makeRequest(`/tasks?${queryParams.toString()}`);

    // Update pagination
    currentPage = response.pagination.current_page;
    totalPages = response.pagination.total_pages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Enable/disable pagination buttons
    prevPageBtn.disabled = !response.pagination.has_prev_page;
    nextPageBtn.disabled = !response.pagination.has_next_page;

    // Render tasks
    renderTasks(response.data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    if (error.message === "Unauthorized" || error.message.includes("token")) {
      handleLogout();
    }
  }
}

// Render task list
function renderTasks(tasks) {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML =
      '<p class="empty-state">No tasks found. Create a new task to get started!</p>';
    return;
  }

  tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    taskCard.setAttribute("data-id", task.id);

    const statusClass = task.completed ? "status-completed" : "status-pending";
    const statusText = task.completed ? "Completed" : "Pending";

    const createdDate = new Date(task.createdAt).toLocaleString();
    const updatedDate = task.updatedAt
      ? new Date(task.updatedAt).toLocaleString()
      : "";

    taskCard.innerHTML = `
            <div class="task-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-status ${statusClass}">${statusText}</div>
            </div>
            <div class="task-description">${escapeHtml(task.description)}</div>
            <div class="task-actions">
                <button class="btn task-btn btn-edit" data-id="${
                  task.id
                }">Edit</button>
                <button class="btn task-btn btn-delete" data-id="${
                  task.id
                }">Delete</button>
            </div>
            <div class="task-date">
                Created: ${createdDate}
                ${updatedDate ? `<br>Updated: ${updatedDate}` : ""}
            </div>
        `;

    taskList.appendChild(taskCard);

    // Add event listeners to the buttons
    taskCard
      .querySelector(".btn-edit")
      .addEventListener("click", () => openEditModal(task));
    taskCard
      .querySelector(".btn-delete")
      .addEventListener("click", () => deleteTask(task.id));
  });
}

// Handle adding a new task
async function handleAddTask(e) {
  e.preventDefault();

  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;

  try {
    await makeRequest("/tasks", "POST", { title, description });

    // Reset form and hide it
    taskForm.reset();
    taskFormContainer.classList.add("hidden");

    // Refresh tasks
    fetchTasks();
  } catch (error) {
    console.error("Error adding task:", error);
    alert(`Failed to add task: ${error.message}`);
  }
}

// Open edit modal with task data
function openEditModal(task) {
  document.getElementById("edit-task-id").value = task.id;
  document.getElementById("edit-title").value = task.title;
  document.getElementById("edit-description").value = task.description;
  document.getElementById("edit-completed").checked = task.completed;

  editModal.classList.remove("hidden");
}

// Handle updating a task
async function handleUpdateTask(e) {
  e.preventDefault();

  const id = document.getElementById("edit-task-id").value;
  const title = document.getElementById("edit-title").value;
  const description = document.getElementById("edit-description").value;
  const completed = document.getElementById("edit-completed").checked;

  try {
    await makeRequest(`/tasks/${id}`, "PUT", { title, description, completed });

    // Close modal
    editModal.classList.add("hidden");

    // Refresh tasks
    fetchTasks();
  } catch (error) {
    console.error("Error updating task:", error);
    alert(`Failed to update task: ${error.message}`);
  }
}

// Delete a task
async function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    try {
      await makeRequest(`/tasks/${id}`, "DELETE");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(`Failed to delete task: ${error.message}`);
    }
  }
}

// Helper functions
function showAuthSection() {
  authSection.classList.remove("hidden");
  tasksSection.classList.add("hidden");
  userInfo.classList.add("hidden");
}

function showTasksSection() {
  authSection.classList.add("hidden");
  tasksSection.classList.remove("hidden");
  userInfo.classList.remove("hidden");
  usernameDisplay.textContent = localStorage.getItem("username");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", init);
