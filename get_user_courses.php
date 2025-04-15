<?php
session_start();
require_once 'config.php';

$user_id = $_SESSION['user_id'];
$sql = "SELECT course_code, course_name FROM user_courses WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$courses = array();
while($course = $result->fetch_assoc()) {
    $courses[] = $course;
}

header('Content-Type: application/json');
echo json_encode($courses);
?> 