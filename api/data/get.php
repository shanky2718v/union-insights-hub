<?php
/**
 * Get Uploaded Data Endpoint
 * 
 * Retrieves processed Excel data for authenticated user
 */

require_once __DIR__ . '/../config/database.php';

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Verify authentication
$token = getAuthToken();
if (!$token) {
    errorResponse('Authentication required', 401);
}

try {
    $pdo = getDbConnection();
    
    // Validate token and get user ID
    $stmt = $pdo->prepare('
        SELECT s.user_id 
        FROM sessions s 
        WHERE s.token = ? AND s.expires_at > NOW()
    ');
    $stmt->execute([$token]);
    $session = $stmt->fetch();
    
    if (!$session) {
        errorResponse('Invalid or expired token', 401);
    }
    
    $userId = $session['user_id'];
    
    // Get user's uploaded data
    $stmt = $pdo->prepare('
        SELECT filename, data, row_count, created_at 
        FROM uploaded_data 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
    ');
    $stmt->execute([$userId]);
    $result = $stmt->fetch();
    
    if (!$result) {
        jsonResponse([
            'data' => [],
            'filename' => null,
            'rowCount' => 0,
        ]);
    }
    
    jsonResponse([
        'data' => json_decode($result['data'], true),
        'filename' => $result['filename'],
        'rowCount' => $result['row_count'],
        'uploadedAt' => $result['created_at'],
    ]);
    
} catch (PDOException $e) {
    error_log('Get data error: ' . $e->getMessage());
    errorResponse('Failed to retrieve data', 500);
}
