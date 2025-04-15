<?php
header('Content-Type: application/json');
session_start();

$response = ['success' => false, 'message' => ''];

try {
    $db = new PDO('mysql:host=localhost;dbname=taskmatrix', 'username', 'password');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not logged in');
    }

    if (!isset($_FILES['profile_picture'])) {
        throw new Exception('No file uploaded');
    }

    $file = $_FILES['profile_picture'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('Invalid file type');
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $extension;
    $uploadPath = 'uploads/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to save file');
    }

    // Update database
    $stmt = $db->prepare('UPDATE users SET profile_picture = ? WHERE id = ?');
    $stmt->execute([$filename, $_SESSION['user_id']]);

    $response['success'] = true;
    $response['message'] = 'Profile picture updated successfully';
    $response['image_path'] = $uploadPath;

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);