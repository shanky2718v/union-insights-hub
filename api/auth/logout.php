<?php
/**
 * Logout Endpoint
 * 
 * Terminates user session and invalidates token
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

// Get auth token
$token = getAuthToken();

if (!$token) {
    errorResponse('No authentication token provided', 401);
}

try {
    $pdo = getDbConnection();
    
    // Delete session by token
    $stmt = $pdo->prepare('DELETE FROM sessions WHERE token = ?');
    $stmt->execute([$token]);
    
    if ($stmt->rowCount() === 0) {
        // Token was already invalid or expired
        errorResponse('Invalid or expired token', 401);
    }
    
    jsonResponse(['success' => true]);
    
} catch (PDOException $e) {
    error_log('Logout error: ' . $e->getMessage());
    errorResponse('Logout failed. Please try again.', 500);
}
