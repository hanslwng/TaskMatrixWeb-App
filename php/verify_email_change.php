<?php
session_start();
include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$otp = $data['otp'];
$new_email = $data['email'];

if (!isset($_SESSION['email_otp']) || !isset($_SESSION['new_email'])) {
    echo json_encode(['success' => false, 'message' => 'OTP session expired']);
    exit;
}

if ($otp == $_SESSION['email_otp'] && $new_email == $_SESSION['new_email']) {
    $user_id = $_SESSION['user_id'];
    
    // Check if email already exists
    $check_sql = "SELECT id FROM users WHERE email = ? AND id != ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("si", $new_email, $user_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }
    
    // Update email
    $sql = "UPDATE users SET email = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $new_email, $user_id);
    
    if ($stmt->execute()) {
        unset($_SESSION['email_otp']);
        unset($_SESSION['new_email']);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database update failed']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid OTP']);
} 