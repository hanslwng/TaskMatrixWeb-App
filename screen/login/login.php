<?php
session_start();
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

try {
    $conn = new mysqli('localhost', 'root', '', 'taskmatrix');
    
    if ($conn->connect_error) {
        throw new Exception('Connection failed');
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        // Validate empty fields
        if (empty($email) || empty($password)) {
            throw new Exception('Please fill in all fields');
        }

        // Get user
        $stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
        if (!$stmt) {
            throw new Exception('System error');
        }

        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            throw new Exception('Email not found');
        }

        $user = $result->fetch_assoc();

        // Verify password
        if (!password_verify($password, $user['password'])) {
            throw new Exception('Incorrect password');
        }

        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];

        error_log("User logged in. Session ID: " . session_id() . ", User ID: " . $_SESSION['user_id']);

        echo json_encode([
            'success' => true,
            'redirect' => '../../screen/screen1.html',
            'userName' => $user['name']
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 