<?php
session_start();
require_once '../db_connection.php';
header('Content-Type: application/json');

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not logged in');
    }

    $user_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("
        SELECT id, title, description, deadline, status, created_at 
        FROM tasks 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ");
    
    $stmt->execute([$user_id]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'tasks' => $tasks
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load tasks: ' . $e->getMessage()
    ]);
}
?> 