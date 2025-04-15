<?php
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    
    switch($action) {
        case 'create':
            // Create new event
            $user_id = $_POST['user_id'];
            $name = $_POST['name'];
            $description = $_POST['description'];
            $event_date = $_POST['date'];
            $latitude = $_POST['latitude'];
            $longitude = $_POST['longitude'];
            
            $sql = "INSERT INTO events (user_id, name, description, event_date, latitude, longitude) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$user_id, $name, $description, $event_date, $latitude, $longitude]);
            
            $event_id = $conn->lastInsertId();
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Event created successfully',
                'event_id' => $event_id
            ]);
            break;
            
        case 'read':
            // Get all events for user
            $user_id = $_GET['user_id'];
            
            $sql = "SELECT * FROM events WHERE user_id = ? ORDER BY event_date DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$user_id]);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'status' => 'success',
                'events' => $events
            ]);
            break;
            
        case 'delete':
            // Delete event
            $event_id = $_POST['event_id'];
            $user_id = $_POST['user_id']; // For security
            
            $sql = "DELETE FROM events WHERE id = ? AND user_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$event_id, $user_id]);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Event deleted successfully'
            ]);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 