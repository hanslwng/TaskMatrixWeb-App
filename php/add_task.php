<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get POST data
    $name = isset($_POST['name']) ? $_POST['name'] : null;
    $course_id = isset($_POST['course_id']) ? intval($_POST['course_id']) : null;
    $tag = isset($_POST['tag']) ? $_POST['tag'] : null;
    $deadline = isset($_POST['deadline']) ? $_POST['deadline'] : null;

    // Validate required fields
    if (!$name || !$course_id || !$deadline) {
        throw new Exception('Missing required fields');
    }

    // First verify the course exists
    $check_sql = "SELECT id FROM courses WHERE id = ?";
    $check_stmt = $conn->prepare($check_sql);
    if (!$check_stmt) {
        throw new Exception("Prepare check failed: " . $conn->error);
    }
    
    $check_stmt->bind_param("i", $course_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        throw new Exception("Course not found");
    }
    $check_stmt->close();

    // Add this at the start of the try block for debugging
    error_log("Received task data: " . print_r($_POST, true));
    error_log("Course ID received: " . $course_id);

    // After checking course exists
    error_log("Course check result: " . $check_result->num_rows . " rows found");

    // Insert task
    $sql = "INSERT INTO tasksmain (name, course_id, tag, deadline) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("siss", $name, $course_id, $tag, $deadline);
    
    if ($stmt->execute()) {
        $task_id = $stmt->insert_id;
        echo json_encode([
            'success' => true,
            'task_id' => $task_id,
            'message' => 'Task added successfully'
        ]);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }

} catch (Exception $e) {
    error_log("Error in add_task.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug_info' => [
            'name' => $name ?? 'not set',
            'course_id' => $course_id ?? 'not set',
            'error' => $e->getMessage()
        ]
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>