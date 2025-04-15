<?php
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    
    switch($action) {
        case 'create':
            $quote = $_POST['quote'];
            $author = $_POST['author'];
            
            $sql = "INSERT INTO quotes (quote, author) VALUES (?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$quote, $author]);
            
            $quote_id = $conn->lastInsertId();
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Quote added successfully',
                'quote_id' => $quote_id
            ]);
            break;
            
        case 'read':
            $sql = "SELECT * FROM quotes ORDER BY created_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $quotes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'status' => 'success',
                'quotes' => $quotes
            ]);
            break;
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 