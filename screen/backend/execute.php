<?php
header('Content-Type: text/html; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $code = $input['code'] ?? '';

    if (empty($code)) {
        echo 'No code provided';
        exit;
    }

    // Create a temporary file
    $tmpFile = tempnam(sys_get_temp_dir(), 'code_');
    file_put_contents($tmpFile, $code);

    // Execute the PHP code
    ob_start();
    try {
        include $tmpFile;
    } catch (Throwable $e) {
        echo "<div style='color: red; padding: 10px;'>";
        echo "Error: " . htmlspecialchars($e->getMessage());
        echo "</div>";
    }
    $output = ob_get_clean();

    // Clean up
    unlink($tmpFile);

    echo $output;
}