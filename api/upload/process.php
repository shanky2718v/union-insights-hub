<?php
/**
 * Excel File Upload and Processing Endpoint
 * 
 * Handles Excel file uploads (.xls, .xlsx)
 * Parses data and stores in database
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

// Verify authentication
$token = getAuthToken();
if (!$token) {
    errorResponse('Authentication required', 401);
}

// Validate token and get user ID
try {
    $pdo = getDbConnection();
    
    $stmt = $pdo->prepare('
        SELECT s.user_id, u.username 
        FROM sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.token = ? AND s.expires_at > NOW()
    ');
    $stmt->execute([$token]);
    $session = $stmt->fetch();
    
    if (!$session) {
        errorResponse('Invalid or expired token', 401);
    }
    
    $userId = $session['user_id'];
    
} catch (PDOException $e) {
    error_log('Token validation error: ' . $e->getMessage());
    errorResponse('Authentication failed', 500);
}

// Validate file upload
if (!isset($_FILES['file'])) {
    errorResponse('No file uploaded');
}

$file = $_FILES['file'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    $uploadErrors = [
        UPLOAD_ERR_INI_SIZE => 'File exceeds server limit',
        UPLOAD_ERR_FORM_SIZE => 'File exceeds form limit',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'File upload stopped by extension',
    ];
    errorResponse($uploadErrors[$file['error']] ?? 'Upload error');
}

// Validate file size
if ($file['size'] > UPLOAD_MAX_SIZE) {
    errorResponse('File size exceeds maximum limit of 10MB');
}

// Validate file extension
$filename = basename($file['name']);
$extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

if (!in_array($extension, UPLOAD_ALLOWED_TYPES)) {
    errorResponse('Invalid file type. Only .xls and .xlsx files are allowed');
}

// Validate MIME type
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

$allowedMimes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream', // Sometimes reported for xlsx
];

if (!in_array($mimeType, $allowedMimes)) {
    errorResponse('Invalid file content type');
}

// Generate secure filename
$secureFilename = sprintf(
    '%s_%s.%s',
    $userId,
    bin2hex(random_bytes(16)),
    $extension
);

// Ensure upload directory exists
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

$uploadPath = UPLOAD_DIR . $secureFilename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    errorResponse('Failed to save uploaded file', 500);
}

try {
    // Parse Excel file
    // Note: In production, use PhpSpreadsheet library:
    // composer require phpoffice/phpspreadsheet
    
    // For this example, we'll use a simplified approach
    // Real implementation would use:
    // $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($uploadPath);
    // $data = $spreadsheet->getActiveSheet()->toArray();
    
    // Placeholder: Read file and return mock data structure
    // Replace with actual Excel parsing logic
    $data = parseExcelFile($uploadPath);
    
    // Store data in database
    $stmt = $pdo->prepare('
        INSERT INTO uploaded_data (user_id, filename, data, row_count)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        filename = VALUES(filename),
        data = VALUES(data),
        row_count = VALUES(row_count)
    ');
    
    $stmt->execute([
        $userId,
        $filename,
        json_encode($data),
        count($data),
    ]);
    
    // Clean up uploaded file after processing
    unlink($uploadPath);
    
    jsonResponse([
        'success' => true,
        'filename' => $filename,
        'rowCount' => count($data),
        'data' => $data,
    ]);
    
} catch (Exception $e) {
    // Clean up on error
    if (file_exists($uploadPath)) {
        unlink($uploadPath);
    }
    
    error_log('Excel processing error: ' . $e->getMessage());
    errorResponse('Failed to process Excel file', 500);
}

/**
 * Parse Excel file and return data array
 * 
 * Note: This is a placeholder. In production, use PhpSpreadsheet:
 * composer require phpoffice/phpspreadsheet
 * 
 * @param string $filePath Path to Excel file
 * @return array Parsed data
 */
function parseExcelFile(string $filePath): array {
    // Placeholder implementation
    // Replace with actual Excel parsing using PhpSpreadsheet
    
    /*
    // Production implementation:
    require 'vendor/autoload.php';
    
    $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
    $worksheet = $spreadsheet->getActiveSheet();
    $rows = $worksheet->toArray();
    
    // First row as headers
    $headers = array_shift($rows);
    
    $data = [];
    foreach ($rows as $row) {
        $item = [];
        foreach ($headers as $index => $header) {
            $item[$header] = $row[$index] ?? null;
        }
        $data[] = $item;
    }
    
    return $data;
    */
    
    // Return empty array for placeholder
    return [];
}
