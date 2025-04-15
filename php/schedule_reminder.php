<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    // Get POST data
    $task_id = $_POST['task_id'] ?? '';
    $email = $_POST['email'] ?? '';
    $task_name = $_POST['task_name'] ?? '';
    $deadline = $_POST['deadline'] ?? '';
    $reminder_time = $_POST['reminder_time'] ?? '';

    // Validate inputs
    if (empty($task_id) || empty($email) || empty($task_name) || empty($deadline) || empty($reminder_time)) {
        throw new Exception('Missing required fields');
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Calculate reminder timestamp
    $deadline_timestamp = strtotime($deadline);
    $reminder_timestamp = $deadline_timestamp - ($reminder_time * 60); // Convert minutes to seconds

    // Insert into reminders table
    $sql = "INSERT INTO reminders (task_id, email, task_name, deadline, reminder_time, reminder_timestamp) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isssii", $task_id, $email, $task_name, $deadline, $reminder_time, $reminder_timestamp);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Reminder scheduled successfully']);
    } else {
        throw new Exception('Failed to schedule reminder');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?> 