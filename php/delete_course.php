<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get and validate course_id
    $course_id = isset($_POST['course_id']) ? $_POST['course_id'] : null;
    
    error_log("Received course_id: " . print_r($course_id, true)); // Debug log
    
    if (!$course_id) {
        throw new Exception('Course ID is required');
    }

    // Simple delete query without user_id
    $sql = "DELETE FROM courses WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("i", $course_id);
    
    error_log("Executing delete query for course_id: $course_id"); // Debug log
    
    if ($stmt->execute()) {
        $affected_rows = $stmt->affected_rows;
        error_log("Affected rows: $affected_rows"); // Debug log
        
        if ($affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Course deleted successfully',
                'affected_rows' => $affected_rows
            ]);
        } else {
            throw new Exception("Course not found or already deleted");
        }
    } else {
        throw new Exception("Delete failed: " . $stmt->error);
    }

} catch (Exception $e) {
    error_log("Error in delete_course.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug_info' => [
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