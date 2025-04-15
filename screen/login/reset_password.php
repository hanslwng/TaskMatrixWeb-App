<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'reset_password_error.log');

// Set mail configuration
ini_set('SMTP', 'smtp.gmail.com');
ini_set('smtp_port', 587);
ini_set('sendmail_from', 'TaskMatrixMain@gmail.com');
ini_set('sendmail_path', 'C:\xampp\sendmail\sendmail.exe -t');

// Database connection
$conn = new mysqli('localhost', 'root', '', 'taskmatrix');

// Check connection
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed'
    ]);
    exit();
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    
    try {
        // Check if email exists in database
        $stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ?");
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("s", $email);
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // Generate reset token
            $token = bin2hex(random_bytes(32));
            date_default_timezone_set('Asia/Manila');
            $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            error_log("Generated token: " . $token);
            error_log("Expiry time set to: " . $expiry);
            
            // Store token in database
            $updateStmt = $conn->prepare("UPDATE users SET reset_token = ?, reset_expiry = ? WHERE id = ?");
            if (!$updateStmt) {
                throw new Exception("Prepare update failed: " . $conn->error);
            }
            
            $updateStmt->bind_param("ssi", $token, $expiry, $user['id']);
            if (!$updateStmt->execute()) {
                throw new Exception("Update failed: " . $updateStmt->error);
            }
            
            if ($updateStmt->affected_rows > 0) {
                // Create reset link - Update this path to match your directory structure
                $reset_link = "http://localhost/TaskMatrixMain/screen/login/reset-password.php?token=" . $token;
                
                // Email content
                $to = $email;
                $subject = "TaskMatrix Password Reset";
                
                // Create email headers
                $headers = "MIME-Version: 1.0\r\n";
                $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
                $headers .= "From: TaskMatrix <TaskMatrixMain@gmail.com>\r\n";
                $headers .= "Reply-To: TaskMatrixMain@gmail.com\r\n";
                $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
                
                // Create email body
                $message = "
                <html>
                <head>
                    <title>Reset Your Password</title>
                </head>
                <body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #4BB6B7;'>Password Reset Request</h2>
                        <p>Hello " . htmlspecialchars($user['name']) . ",</p>
                        <p>We received a request to reset your TaskMatrix password.</p>
                        <p>Click the link below to reset your password:</p>
                        <p style='margin: 20px 0;'>
                            <a href='" . $reset_link . "' 
                               style='background-color: #4BB6B7; 
                                      color: white; 
                                      padding: 12px 25px; 
                                      text-decoration: none; 
                                      border-radius: 5px;'>
                                Reset Password
                            </a>
                        </p>
                        <p>Or copy this link: <br>" . $reset_link . "</p>
                        <p>This link will expire in 1 hour.</p>
                        <p><small>If you didn't request this reset, please ignore this email.</small></p>
                    </div>
                </body>
                </html>";

                error_log("Attempting to send email to: " . $email);
                
                // Attempt to send email
                $mail_sent = mail($to, $subject, $message, $headers);
                
                if ($mail_sent) {
                    error_log("Email sent successfully to: " . $email);
                    echo json_encode([
                        'success' => true,
                        'message' => "Password reset instructions have been sent to your email."
                    ]);
                } else {
                    error_log("Failed to send email to: " . $email);
                    // For development/testing, include the token in the response
                    echo json_encode([
                        'success' => true,
                        'message' => "Password reset link generated. For testing, use this link: " . $reset_link,
                        'debug_token' => $token
                    ]);
                }
            } else {
                throw new Exception("No rows were updated");
            }
            
            $updateStmt->close();
        } else {
            // Don't reveal if email exists
            echo json_encode([
                'success' => true,
                'message' => "If the email exists in our system, you will receive reset instructions shortly."
            ]);
        }
        
        $stmt->close();
    } catch (Exception $e) {
        error_log("Error in reset process: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'An error occurred. Please try again later.'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

$conn->close();
?> 