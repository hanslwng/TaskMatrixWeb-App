<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
$conn = new mysqli('localhost', 'root', '', 'taskmatrix');

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$token = isset($_GET['token']) ? $_GET['token'] : (isset($_POST['token']) ? $_POST['token'] : '');
$error = '';
$success = '';
$validToken = false;

// Debug logging
error_log("Token received: " . $token);

// Verify token if provided
if (!empty($token)) {
    // First, just check if the token exists
    $stmt = $conn->prepare("SELECT id, email, reset_expiry FROM users WHERE reset_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $expiry = strtotime($user['reset_expiry']);
        $now = time();
        
        error_log("Token expiry time: " . $user['reset_expiry']);
        error_log("Current time: " . date('Y-m-d H:i:s'));
        error_log("Expiry timestamp: " . $expiry);
        error_log("Current timestamp: " . $now);
        
        if ($now <= $expiry) {
            $validToken = true;
            error_log("Token is valid");
        } else {
            $error = "Reset link has expired. Please request a new password reset.";
            error_log("Token has expired");
            
            // Clear expired token
            $clearStmt = $conn->prepare("UPDATE users SET reset_token = NULL, reset_expiry = NULL WHERE reset_token = ?");
            $clearStmt->bind_param("s", $token);
            $clearStmt->execute();
            $clearStmt->close();
        }
    } else {
        $error = "Invalid reset link. Please request a new password reset.";
        error_log("Token not found in database");
    }
    $stmt->close();
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $validToken) {
    $new_password = $_POST['new_password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    
    try {
        if (empty($new_password) || empty($confirm_password)) {
            throw new Exception("All fields are required");
        }
        
        if ($new_password !== $confirm_password) {
            throw new Exception("Passwords do not match");
        }
        
        // Update password and clear reset token
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $updateStmt = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expiry = NULL WHERE reset_token = ?");
        $updateStmt->bind_param("ss", $hashed_password, $token);
        $updateStmt->execute();
        
        if ($updateStmt->affected_rows > 0) {
            $success = "Password successfully reset! You can now login with your new password.";
            $validToken = false; // Hide the form after successful reset
        } else {
            throw new Exception("Failed to reset password");
        }
        
        $updateStmt->close();
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - TaskMatrix</title>
    <link href="https://cdn.lineicons.com/4.0/lineicons.css" rel="stylesheet"/>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #4BB6B7, #3a9293);
        }

        .reset-container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            width: 90%;
            max-width: 400px;
        }

        .reset-container h2 {
            color: #4BB6B7;
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .reset-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .input-group {
            position: relative;
        }

        .input-group i {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #4BB6B7;
        }

        .input-group input {
            width: 100%;
            padding: 12px 12px 12px 40px;
            border: 2px solid rgba(75, 182, 183, 0.2);
            border-radius: 8px;
            outline: none;
            transition: all 0.3s ease;
        }

        .input-group input:focus {
            border-color: #4BB6B7;
            box-shadow: 0 0 0 3px rgba(75, 182, 183, 0.1);
        }

        button {
            background: linear-gradient(135deg, #4BB6B7, #3a9293);
            color: white;
            padding: 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(75, 182, 183, 0.2);
        }

        .error {
            color: #ef4444;
            text-align: center;
            margin-bottom: 1rem;
            padding: 8px;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 6px;
        }

        .success {
            color: #4BB6B7;
            text-align: center;
            margin-bottom: 1rem;
            padding: 8px;
            background: rgba(75, 182, 183, 0.1);
            border-radius: 6px;
        }

        .login-link {
            text-align: center;
            margin-top: 1rem;
        }

        .login-link a {
            color: #4BB6B7;
            text-decoration: none;
            font-weight: 500;
        }

        .login-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="reset-container">
        <h2>Reset Password</h2>
        
        <?php if ($error): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
            <div class="login-link">
                <a href="index.html">Return to Login</a>
            </div>
        <?php elseif ($success): ?>
            <div class="success"><?php echo htmlspecialchars($success); ?></div>
            <div class="login-link">
                <a href="index.html">Return to Login</a>
            </div>
        <?php elseif ($validToken): ?>
            <form class="reset-form" method="POST">
                <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>">
                
                <div class="input-group">
                    <i class="lni lni-lock"></i>
                    <input type="password" name="new_password" placeholder="New Password" required 
                           minlength="8" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" 
                           title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters">
                </div>
                
                <div class="input-group">
                    <i class="lni lni-lock"></i>
                    <input type="password" name="confirm_password" placeholder="Confirm New Password" required>
                </div>
                
                <button type="submit">Reset Password</button>
            </form>
        <?php else: ?>
            <div class="error">Invalid reset link.</div>
            <div class="login-link">
                <a href="index.html">Return to Login</a>
            </div>
        <?php endif; ?>
    </div>

    <script>
        // Password validation
        document.querySelector('form')?.addEventListener('submit', function(e) {
            const password = this.querySelector('input[name="new_password"]').value;
            const confirm = this.querySelector('input[name="confirm_password"]').value;
            
            if (password !== confirm) {
                e.preventDefault();
                alert('Passwords do not match!');
            }
        });
    </script>
</body>
</html> 