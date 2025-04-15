<?php
require_once '../db_connection.php';

// Add logging
function writeLog($message) {
    $logFile = __DIR__ . '/reminder_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}

function sendReminderEmail($email, $taskName, $deadline) {
    $subject = "⏰ Task Deadline Reminder: $taskName";
    
    // Format deadline
    $deadlineDate = new DateTime($deadline);
    $formattedDeadline = $deadlineDate->format('F j, Y \a\t g:i A');
    
    $message = "
    <html>
    <head>
        <style>
            .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8fafc; }
            .deadline { background: #e2e8f0; padding: 10px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Task Reminder</h1>
            </div>
            <div class='content'>
                <h2>$taskName</h2>
                <div class='deadline'>
                    <strong>Deadline:</strong> $formattedDeadline
                </div>
                <p>This is a reminder about your upcoming task deadline.</p>
            </div>
        </div>
    </body>
    </html>";

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: Task Matrix <TaskMatrixMain@gmail.com>',
        'Reply-To: TaskMatrixMain@gmail.com'
    ];

    return mail($email, $subject, $message, implode("\r\n", $headers));
}

try {
    writeLog("Starting reminder check...");
    
    $currentTime = date('Y-m-d H:i:s');
    
    // Get tasks needing reminders
    $query = "SELECT t.*, er.email, er.reminder_time 
              FROM tasks t 
              JOIN email_reminders er ON t.id = er.task_id 
              WHERE t.deadline > ? 
              AND er.is_verified = 1 
              AND er.reminder_time IN (30, 60, 1440) 
              AND DATE_SUB(t.deadline, INTERVAL er.reminder_time MINUTE) <= ?
              AND DATE_SUB(t.deadline, INTERVAL er.reminder_time MINUTE) >= DATE_SUB(?, INTERVAL 5 MINUTE)";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param('sss', $currentTime, $currentTime, $currentTime);
    $stmt->execute();
    $result = $stmt->get_result();

    $sentCount = 0;
    $failedCount = 0;

    while ($task = $result->fetch_assoc()) {
        writeLog("Processing reminder for task: {$task['name']} ({$task['email']})");
        
        if (sendReminderEmail($task['email'], $task['name'], $task['deadline'])) {
            $sentCount++;
            writeLog("✓ Reminder sent successfully");
        } else {
            $failedCount++;
            writeLog("✗ Failed to send reminder");
        }
    }

    writeLog("Completed: Sent $sentCount reminders, Failed: $failedCount");

} catch (Exception $e) {
    writeLog("ERROR: " . $e->getMessage());
}

writeLog("Reminder check completed\n");
?>