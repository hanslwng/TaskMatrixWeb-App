<?php
session_start();
require_once '../db_connection.php';
header('Content-Type: application/json');

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not logged in');
    }

    $task_id = $_POST['task_id'] ?? null;
    $user_id = $_SESSION['user_id'];

    if (!$task_id) {
        throw new Exception('Task ID is required');
    }

    // Start transaction
    $conn->beginTransaction();

    // Delete associated reminders first
    $stmt = $conn->prepare("DELETE FROM email_reminders WHERE task_id = ? AND user_id = ?");
    $stmt->execute([$task_id, $user_id]);

    // Delete the task
    $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
    $stmt->execute([$task_id, $user_id]);

    if ($stmt->rowCount() === 0) {
        throw new Exception('Task not found or unauthorized');
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Task deleted successfully'
    ]);

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    
    echo json_encode([
        'success' => false,
        'message' => 'Failed to delete task: ' . $e->getMessage()
    ]);
}
?> 