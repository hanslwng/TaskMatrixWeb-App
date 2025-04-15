<?php
header('Content-Type: application/json');

$id = $_GET['id'] ?? '';

if (empty($id) || !preg_match('/^[a-f0-9]+$/', $id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid ID']);
    exit;
}

$filePath = "../data/{$id}.json";

if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'Code not found']);
    exit;
}

$data = json_decode(file_get_contents($filePath), true);
echo json_encode($data);