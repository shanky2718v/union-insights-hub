<?php
/**
 * Login Endpoint
 * 
 * Authenticates user with username and password
 * Returns JWT token on successful authentication
 */

require_once __DIR__ . '/../config/database.php';

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Get and validate input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    errorResponse('Invalid JSON input');
}

$missing = validateRequired($input, ['username', 'password']);
if ($missing) {
    errorResponse('Missing required fields: ' . implode(', ', $missing));
}

$username = sanitizeInput($input['username']);
$password = $input['password']; // Don't sanitize password before verification

// Validate username format
if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
    errorResponse('Invalid username format');
}

try {
    $pdo = getDbConnection();
    
    // Get user by username using prepared statement
    $stmt = $pdo->prepare('SELECT id, username, password_hash, role, email FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Use consistent error message to prevent username enumeration
        errorResponse('Invalid username or password', 401);
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        errorResponse('Invalid username or password', 401);
    }
    
    // Generate JWT token
    $tokenPayload = [
        'user_id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + JWT_EXPIRY,
    ];
    
    // Simple JWT generation (for production, use a proper JWT library)
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode($tokenPayload));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    $token = "$header.$payload.$signature";
    
    // Store session in database
    $sessionId = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + JWT_EXPIRY);
    
    $stmt = $pdo->prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)');
    $stmt->execute([$sessionId, $user['id'], $token, $expiresAt]);
    
    // Return success response
    jsonResponse([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'email' => $user['email'],
        ],
        'token' => $token,
    ]);
    
} catch (PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    errorResponse('Authentication failed. Please try again.', 500);
}
