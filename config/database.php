<?php
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=taskmatrix;charset=utf8mb4",
        "root",  // your database username
        "",      // your database password
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?> 