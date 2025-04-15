<?php
require_once '../config/database.php';
session_start();

header('Content-Type: application/json');

function getActivityIcon($action_type) {
    $icons = [
        'CREATE' => 'add_circle',
        'UPDATE' => 'edit',
        'DELETE' => 'delete',
        'COMPLETE' => 'check_circle',
        'LOGIN' => 'login',
        'LOGOUT' => 'logout',
        'PROFILE' => 'person',
        'SETTINGS' => 'settings',
        'MAP' => 'location_on',
        'NOTE' => 'note',
        'TASK' => 'task'
    ];
    return $icons[$action_type] ?? 'info';
}

try {
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    
    switch($action) {
        case 'get_history':
            $sql = "SELECT 
                    ah.*,
                    DATE_FORMAT(ah.timestamp, '%Y-%m-%d %H:%i:%s') as formatted_time,
                    CASE 
                        WHEN ah.timestamp > NOW() - INTERVAL 1 HOUR THEN 'recent'
                        WHEN ah.timestamp > NOW() - INTERVAL 24 HOUR THEN 'today'
                        WHEN ah.timestamp > NOW() - INTERVAL 7 DAY THEN 'week'
                        ELSE 'older'
                    END as time_category
                   FROM activity_history ah
                   WHERE user_id = ?
                   ORDER BY timestamp DESC
                   LIMIT 20";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([$_SESSION['user_id']]);
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Group activities by time category
            $grouped_activities = [];
            foreach ($activities as $activity) {
                $category = $activity['time_category'];
                if (!isset($grouped_activities[$category])) {
                    $grouped_activities[$category] = [];
                }
                $activity['icon'] = getActivityIcon($activity['action_type']);
                $grouped_activities[$category][] = $activity;
            }
            
            echo json_encode([
                'status' => 'success',
                'activities' => $grouped_activities
            ]);
            break;
            
        case 'add_activity':
            $action_type = $_POST['action_type'];
            $description = $_POST['description'];
            $user_id = $_SESSION['user_id'];
            
            $sql = "INSERT INTO activity_history 
                    (user_id, action_type, description, timestamp, ip_address, user_agent) 
                    VALUES (?, ?, ?, NOW(), ?, ?)";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $user_id,
                $action_type,
                $description,
                $_SERVER['REMOTE_ADDR'],
                $_SERVER['HTTP_USER_AGENT']
            ]);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Activity logged successfully'
            ]);
            break;
    }
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 