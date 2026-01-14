<?php
/**
 * Database Configuration
 * 
 * Union Bank Data Analytics Portal
 * 
 * IMPORTANT: Update these values with your actual database credentials
 * before deploying to production.
 */

// Database connection settings
define('DB_HOST', 'localhost');
define('DB_NAME', 'union_bank_analytics');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_CHARSET', 'utf8mb4');

// JWT settings for token-based authentication
define('JWT_SECRET', 'your-super-secret-key-change-this-in-production');
define('JWT_EXPIRY', 3600); // 1 hour in seconds

// File upload settings
define('UPLOAD_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('UPLOAD_ALLOWED_TYPES', ['xls', 'xlsx']);
define('UPLOAD_DIR', __DIR__ . '/../uploads/');

/**
 * Get PDO database connection
 * 
 * @return PDO Database connection instance
 * @throws PDOException If connection fails
 */
function getDbConnection(): PDO {
    static $pdo = null;
    
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST,
            DB_NAME,
            DB_CHARSET
        );
        
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Log error securely - don't expose details to client
            error_log('Database connection failed: ' . $e->getMessage());
            throw new PDOException('Database connection failed');
        }
    }
    
    return $pdo;
}

/**
 * Sanitize input string
 * 
 * @param string $input Input to sanitize
 * @return string Sanitized input
 */
function sanitizeInput(string $input): string {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate required fields in request
 * 
 * @param array $data Request data
 * @param array $required Required field names
 * @return array|null Array of missing fields or null if all present
 */
function validateRequired(array $data, array $required): ?array {
    $missing = [];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    return empty($missing) ? null : $missing;
}

/**
 * Send JSON response
 * 
 * @param array $data Response data
 * @param int $statusCode HTTP status code
 */
function jsonResponse(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Send error response
 * 
 * @param string $message Error message
 * @param int $statusCode HTTP status code
 */
function errorResponse(string $message, int $statusCode = 400): void {
    jsonResponse(['success' => false, 'error' => $message], $statusCode);
}

/**
 * Get Authorization token from headers
 * 
 * @return string|null Token or null if not found
 */
function getAuthToken(): ?string {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
        return $matches[1];
    }
    
    return null;
}
