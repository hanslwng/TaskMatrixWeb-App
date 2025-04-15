<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $code = $input['code'] ?? '';
    $language = $input['language'] ?? '';

    if (empty($code) || empty($language)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }

    // Generate a unique ID
    $shareId = uniqid();
    
    // Save the code
    $data = [
        'code' => $code,
        'language' => $language,
        'timestamp' => time()
    ];
    
    file_put_contents("../data/{$shareId}.json", json_encode($data));
    
    echo json_encode(['shareId' => $shareId]);
}