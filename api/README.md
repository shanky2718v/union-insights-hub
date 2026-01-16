# Union Bank Data Analytics Portal - PHP Backend API

## Overview

This directory contains the PHP backend API for the Union Bank Data Analytics Portal. These PHP files are provided as reference implementations for deploying on your own server.
## Requirements

- PHP 8.0 or higher
- MySQL 5.7+ or MariaDB 10.3+
- Composer (for dependency management)
- Apache/Nginx web server

## Directory Structure

```
api/
├── config/
│   └── database.php      # Database connection configuration
├── auth/
│   ├── login.php         # User authentication endpoint
│   ├── logout.php        # Session termination
│   └── session.php       # Get current session
├── upload/
│   └── process.php       # Excel file upload and processing
├── data/
│   ├── get.php           # Retrieve processed data
│   └── clear.php         # Clear user data
└── README.md             # This file
```

## Setup Instructions

### 1. Database Setup

Create a MySQL database and run the following SQL:

```sql
CREATE DATABASE union_bank_analytics;

USE union_bank_analytics;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE uploaded_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    data JSON NOT NULL,
    row_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default users (passwords are hashed versions of admin123 and user123)
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');
```

### 2. Configure Database Connection

Edit `config/database.php` with your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'union_bank_analytics');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### 3. Configure Web Server

#### Apache (.htaccess)

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# CORS headers
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

#### Nginx

```nginx
location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
    
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
}
```

### 4. Connect Frontend to Backend

Set the `VITE_API_URL` environment variable:
```
VITE_API_URL=https://your-server.com/api
```

## API Endpoints

### Authentication

#### POST /auth/login.php
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "username": "admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout.php
Terminate current session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true
}
```

### Data Upload

#### POST /upload/process.php
Upload and process Excel file.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
- `file`: Excel file (.xls or .xlsx)

**Response:**
```json
{
  "success": true,
  "filename": "data.xlsx",
  "rowCount": 150,
  "data": [...]
}
```

#### GET /data/get.php
Get uploaded data for current user.

**Response:**
```json
{
  "data": [
    {"name": "Jan", "value": 100},
    {"name": "Feb", "value": 200}
  ]
}
```

## Security Features

### Implemented Security Measures

1. **Password Hashing**: All passwords are hashed using bcrypt (PASSWORD_DEFAULT)

2. **Prepared Statements**: All database queries use PDO prepared statements to prevent SQL injection

3. **Input Validation**: All inputs are validated and sanitized before processing

4. **CSRF Protection**: Token-based authentication prevents CSRF attacks

5. **XSS Prevention**: All outputs are encoded using htmlspecialchars()

6. **File Upload Security**:
   - File type validation (only .xls and .xlsx allowed)
   - File size limit (10MB max)
   - Secure file naming to prevent directory traversal

7. **Rate Limiting**: Implement rate limiting at the server level (recommended)

## Testing

Run the test suite:

```bash
# Install PHPUnit
composer require --dev phpunit/phpunit

# Run tests
./vendor/bin/phpunit tests/
```

## Deployment Checklist

- [ ] Set strong database credentials
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins (not *)
- [ ] Set up rate limiting
- [ ] Enable error logging (not display)
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Implement monitoring

## Support

For issues with the PHP backend, please consult your hosting provider or PHP development team.
