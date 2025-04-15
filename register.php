<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the token
    $recaptchaToken = $_POST['recaptcha_token'];
    
    // Your project ID and API key from Google Cloud Console
    $projectId = 'your-project-id';
    $apiKey = 'your-api-key';
    
    // Create assessment
    $ch = curl_init();
    $url = "https://recaptchaenterprise.googleapis.com/v1/projects/{$projectId}/assessments?key={$apiKey}";
    
    $data = [
        'event' => [
            'token' => $recaptchaToken,
            'siteKey' => '6Ldd7SEgAAAAA01yGJwJmw8xdD1nvq15IoomWLr',
            'expectedAction' => 'submit'
        ]
    ];

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    $assessment = json_decode($response);
    curl_close($ch);

    // Check if score is acceptable (e.g., > 0.5)
    if ($assessment && isset($assessment->riskAnalysis->score) && $assessment->riskAnalysis->score > 0.5) {
        // Get the form data
        $name = $_POST['name'];
        $email = $_POST['email'];
        $password = $_POST['password'];

        // Your existing registration logic here...
        // (database connection, validation, etc.)

        echo json_encode([
            'success' => true,
            'message' => 'Registration successful! Please login.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Security check failed. Please try again.'
        ]);
    }
}
?>