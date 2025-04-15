<?php
session_start();
include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$new_email = $data['email'];

// Generate OTP
$otp = rand(100000, 999999);
$_SESSION['email_otp'] = $otp;
$_SESSION['new_email'] = $new_email;

// Email content
$to = $new_email;
$subject = "TaskMatrix - Email Verification Code";
$message = "
<html>
<head>
    <title>Email Verification</title>
</head>
<body>
    <h2>TaskMatrix Email Verification</h2>
    <p>Your verification code is: <strong>$otp</strong></p>
    <p>Please enter this code to verify your email address.</p>
    <p>If you didn't request this change, please ignore this email.</p>
</body>
</html>
";

// Email headers
$headers = array(
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: TaskMatrixMain@gmail.com',
    'Reply-To: TaskMatrixMain@gmail.com',
    'X-Mailer: PHP/' . phpversion()
);

// Send email
if(mail($to, $subject, $message, implode("\r\n", $headers))) {
    echo json_encode(['success' => true]);
} else {
    $error = error_get_last()['message'];
    echo json_encode(['success' => false, 'message' => 'Failed to send OTP', 'error' => $error]);
} 