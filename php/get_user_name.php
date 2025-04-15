<?php
require_once 'db_connection.php';

session_start();
header('Content-Type: application/json');

try {
    $stmt = $conn->prepare("SELECT name FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'name' => $user['name'] ?? 'Guest'
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching user name'
    ]);
}
?> 