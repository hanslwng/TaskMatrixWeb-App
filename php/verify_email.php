<?php
session_start();
require_once '../db_connection.php';
header('Content-Type: application/json');

function sendVerificationEmail($to, $code) {
    $subject = "Task Matrix Verification Code";
    
    // HTML email body
    $message = "
    <html>
    <head>
        <title>Email Verification</title>
    </head>
    <body>
        <div style='background-color: #f6f9fc; padding: 20px; font-family: Arial, sans-serif;'>
            <h2 style='color: #2563eb;'>Your Verification Code</h2>
            <p>Here is your verification code for Task Matrix:</p>
            <h1 style='color: #1e40af; letter-spacing: 5px; padding: 10px; background: #e2e8f0; display: inline-block; border-radius: 4px;'>$code</h1>
            <p>Please enter this code to verify your email address.</p>
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
    </body>
    </html>";

    // Email headers
    $headers = array(
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: TaskMatrixMain@gmail.com',
        'Reply-To: TaskMatrixMain@gmail.com',
        'X-Mailer: PHP/' . phpversion()
    );

    // SMTP settings
    ini_set("SMTP", "smtp.gmail.com");
    ini_set("smtp_port", "587");
    ini_set('sendmail_from', 'TaskMatrixMain@gmail.com');

    // Send email
    $success = mail($to, $subject, $message, implode("\r\n", $headers));

    // Log the attempt
    error_log("Email sending attempt to $to - Success: " . ($success ? 'Yes' : 'No'));

    return $success;
}

try {
    if (!isset($_POST['action'])) {
        throw new Exception('Missing action parameter');
    }

    $action = $_POST['action'];

    if ($action === 'send_code') {
        if (!isset($_POST['email'])) {
            throw new Exception('Email is required');
        }

        $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
        if (!$email) {
            throw new Exception('Invalid email format');
        }

        // Generate verification code
        $verification_code = sprintf("%06d", mt_rand(0, 999999));
        
        // Store in session
        $_SESSION['verification_code'] = $verification_code;
        $_SESSION['temp_email'] = $email;
        $_SESSION['code_timestamp'] = time();

        // Log the verification code (for debugging)
        error_log("Generated verification code for $email: $verification_code");

        // Send email
        if (sendVerificationEmail($email, $verification_code)) {
            echo json_encode([
                'success' => true,
                'message' => 'Verification code sent to your email'
            ]);
        } else {
            throw new Exception('Failed to send verification code. Please check your email settings.');
        }
    }
    elseif ($action === 'verify_code') {
        if (!isset($_POST['code']) || !isset($_POST['email'])) {
            throw new Exception('Code and email are required');
        }

        $code = $_POST['code'];
        $email = $_POST['email'];

        if (!isset($_SESSION['verification_code']) || !isset($_SESSION['temp_email'])) {
            throw new Exception('No verification in progress');
        }

        if ($code === $_SESSION['verification_code'] && $email === $_SESSION['temp_email']) {
            $_SESSION['email_verified'] = true;
            $_SESSION['verified_email'] = $email;
            
            echo json_encode([
                'success' => true,
                'message' => 'Email verified successfully'
            ]);
        } else {
            throw new Exception('Invalid verification code');
        }
    }

} catch (Exception $e) {
    error_log("Verification error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>