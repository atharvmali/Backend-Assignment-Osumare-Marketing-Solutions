# Task Management API

A full-stack task management application with a RESTful API backend (Node.js/Express) and server-side rendered frontend using EJS templates.

## Project Overview

This repository contains the completed backend assignment along with a frontend implementation:

- **Backend**: RESTful API with authentication, pagination, filtering, and sorting
- **Frontend**: Server-side rendered interface using EJS templates (located in the `views` directory)

## Live Demo

The application is deployed and available at:
[https://backend-assignment-osumare-marketing.onrender.com/](https://backend-assignment-osumare-marketing.onrender.com/)

## Features

- **User Authentication**
  - Register new user accounts
  - Login with JWT token authentication
  - Protected routes requiring authentication

- **Task Management**
  - Create, read, update, and delete tasks
  - User-specific tasks (users can only manage their own tasks)
  - Advanced filtering and sorting capabilities
  - Pagination for task listing

- **Server-Side Rendering**
  - EJS templates for dynamic page generation
  - Clean separation of frontend and backend code

- **API Documentation**
  - Comprehensive API documentation in `API_DOCUMENTATION.md`
  - Technical report explaining design decisions in `TECHNICAL_REPORT.md`

## Technology Stack

- **Backend**
  - Node.js
  - Express.js
  - EJS (Embedded JavaScript templates)
  - JSON Web Tokens (JWT) for authentication
  - bcryptjs for password hashing

- **Frontend**
  - HTML5
  - CSS3
  - JavaScript (vanilla)
  - EJS templates

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository:
   ```bash
   git clone atharvmali/Backend-Assignment-Osumare-Marketing-Solutions
   ```

2. Navigate to the project directory:
   ```bash
   cd Backend-Assignment-Osumare-Marketing-Solutions
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Access the application:
   - Live demo: [https://backend-assignment-osumare-marketing.onrender.com/](https://backend-assignment-osumare-marketing.onrender.com/)
   - Local frontend: Open `http://localhost:3000` in your web browser
   - Local API: Available at `http://localhost:3000/tasks` (requires authentication)

### API Documentation

For detailed API documentation, please refer to the `API_DOCUMENTATION.md` file included in this repository.

## Acknowledgments

This project was completed as part of a backend assignment of Osumare Marketing Solutions, demonstrating RESTful API principles and Node.js implementation. 