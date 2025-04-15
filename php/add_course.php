<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    // Get POST data
    $course_code = isset($_POST['course_code']) ? $_POST['course_code'] : null;
    $course_name = isset($_POST['course_name']) ? $_POST['course_name'] : null;
    $professor_name = isset($_POST['professor_name']) ? $_POST['professor_name'] : null;

    // Validate data
    if (!$course_code || !$course_name || !$professor_name) {
        throw new Exception('Missing required fields');
    }

    // Insert course without user_id
    $sql = "INSERT INTO courses (course_code, course_name, professor_name) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("sss", $course_code, $course_name, $professor_name);
    
    if ($stmt->execute()) {
        $course_id = $stmt->insert_id;
        echo json_encode([
            'success' => true,
            'course_id' => $course_id,
            'message' => 'Course added successfully'
        ]);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }

} catch (Exception $e) {
    error_log("Error in add_course.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
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