<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'mail_test_error.log');

// Test basic mail function
$to = "your-email@gmail.com"; // Replace with your email
$subject = "Test Email from TaskMatrix";
$message = "This is a test email from TaskMatrix";
$headers = "From: TaskMatrixMain@gmail.com";

echo "<h2>Testing Email Configuration</h2>";

// Test 1: Basic mail
$result = mail($to, $subject, $message, $headers);
echo "Basic mail test result: " . ($result ? "Success" : "Failed") . "<br>";

// Test 2: HTML mail
$html_message = "<html><body><h1>Test HTML Email</h1><p>This is a test.</p></body></html>";
$html_headers = "MIME-Version: 1.0\r\n";
$html_headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$html_headers .= "From: TaskMatrixMain@gmail.com\r\n";

$result2 = mail($to, "HTML Test Email", $html_message, $html_headers);
echo "HTML mail test result: " . ($result2 ? "Success" : "Failed") . "<br>";

// Display mail configuration
echo "<h3>Mail Configuration:</h3>";
echo "<pre>";
echo "sendmail_path: " . ini_get('sendmail_path') . "\n";
echo "SMTP: " . ini_get('SMTP') . "\n";
echo "smtp_port: " . ini_get('smtp_port') . "\n";
echo "PHP version: " . phpversion() . "\n";
echo "</pre>";

// Check if sendmail exists
$sendmail_path = "C:\xampp\sendmail\sendmail.exe";
echo "Sendmail exists: " . (file_exists($sendmail_path) ? "Yes" : "No") . "<br>";

// Display error log contents
echo "<h3>Error Log Contents:</h3>";
echo "<pre>";
if(file_exists('mail_test_error.log')) {
    echo htmlspecialchars(file_get_contents('mail_test_error.log'));
}
echo "</pre>";
?> 