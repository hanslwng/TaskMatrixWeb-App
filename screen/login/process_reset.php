<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
$conn = new mysqli('localhost', 'root', '', 'taskmatrix');

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed'
    ]));
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'] ?? '';
    $new_password = $_POST['new_password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    
    try {
        if (empty($token) || empty($new_password) || empty($confirm_password)) {
            throw new Exception('All fields are required');
        }
        
        if ($new_password !== $confirm_password) {
            throw new Exception('Passwords do not match');
        }
        
        // Verify token and check expiry
        $stmt = $conn->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expiry > NOW()");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Invalid or expired reset link');
        }
        
        // Update password
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $updateStmt = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expiry = NULL WHERE reset_token = ?");
        $updateStmt->bind_param("ss", $hashed_password, $token);
        $updateStmt->execute();
        
        if ($updateStmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Password successfully reset! You can now login with your new password.'
            ]);
        } else {
            throw new Exception('Failed to reset password');
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}
?> 