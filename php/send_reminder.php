<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

function sendEmail($to, $subject, $message) {
    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: Your Task Manager <noreply@yourdomain.com>' . "\r\n";
    
    // Send email
    return mail($to, $subject, $message, $headers);
}

try {
    // Get JSON POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    $task_id = $data['task_id'] ?? '';
    $email = $data['email'] ?? '';
    $task_name = $data['task_name'] ?? '';
    $deadline = $data['deadline'] ?? '';

    // Validate inputs
    if (empty($task_id) || empty($email) || empty($task_name) || empty($deadline)) {
        throw new Exception('Missing required fields');
    }

    // Create email content
    $subject = "Task Reminder: $task_name";
    $message = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Task Reminder</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .task-info {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #000DFF;
        }
        .deadline {
            color: #dc3545;
            font-weight: bold;
            font-size: 1.1em;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #000DFF;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
        }
        .urgency-indicator {
            display: inline-block;
            padding: 5px 10px;
            background: #ff4444;
            color: white;
            border-radius: 15px;
            font-size: 0.8em;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <h1>⏰ Task Reminder</h1>
        </div>
        <div class='content'>
            <div class='urgency-indicator'>Action Required!</div>
            
            <p>Hello there!</p>
            <p>This is a friendly reminder about an upcoming task that needs your attention.</p>
            
            <div class='task-info'>
                <h2>📝 {$task_name}</h2>
                <div class='deadline'>
                    ⏳ Deadline: {$deadline}
                </div>
            </div>
            
            <p>Don't let this task slip through the cracks! Making progress now will help you stay ahead of your schedule.</p>
            
            <center>
                <a href='YOUR_TASK_URL' class='button'>View Task Details</a>
            </center>
        </div>
        
        <div class='footer'>
            <p>This is an automated reminder from your Task Manager</p>
            <p>© " . date('Y') . " Task Manager. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
";

    // Send the email
    if (sendEmail($email, $subject, $message)) {
        // Update reminder status in database
        $sql = "UPDATE reminders SET reminder_sent = 1 WHERE task_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $task_id);
        $stmt->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Reminder email sent successfully'
        ]);
    } else {
        throw new Exception('Failed to send reminder email');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?> 