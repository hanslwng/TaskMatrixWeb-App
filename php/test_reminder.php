<?php
require_once '../db_connection.php';
header('Content-Type: application/json');

function sendTestEmail($email, $taskName, $deadline) {
    $subject = "Test Reminder: $taskName";
    
    $message = "
    <html>
    <body>
        <h2>Test Reminder</h2>
        <p>Task: $taskName</p>
        <p>Deadline: $deadline</p>
    </body>
    </html>";

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: TaskMatrixMain@gmail.com',
        'Reply-To: TaskMatrixMain@gmail.com'
    ];

    return mail($email, $subject, $message, implode("\r\n", $headers));
}

try {
    // Get tasks with reminders
    $query = "SELECT t.*, tr.email, tr.reminder_time 
              FROM tasks t 
              JOIN task_reminders tr ON t.id = tr.task_id 
              WHERE tr.reminder_sent = 0";
              
    $result = $conn->query($query);
    
    $sent = 0;
    $failed = 0;
    
    while ($task = $result->fetch_assoc()) {
        if (sendTestEmail($task['email'], $task['name'], $task['deadline'])) {
            $sent++;
        } else {
            $failed++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Test complete: $sent sent, $failed failed"
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 