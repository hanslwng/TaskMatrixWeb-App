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
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        // Validate empty fields
        if (empty($name) || empty($email) || empty($password)) {
            throw new Exception('Please fill in all fields');
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Please enter a valid email address');
        }

        // Validate password length
        if (strlen($password) < 6) {
            throw new Exception('Password must be at least 6 characters long');
        }

        // Check if email exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        if (!$stmt) {
            throw new Exception('System error');
        }

        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            throw new Exception('This email is already registered');
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Insert new user
        $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        if (!$stmt) {
            throw new Exception('System error');
        }

        $stmt->bind_param("sss", $name, $email, $hashedPassword);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Registration successful! Please login.'
            ]);
        } else {
            throw new Exception('Registration failed');
        }
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 