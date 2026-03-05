<?php
require_once 'database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM LAUNDRY_SERVICE ORDER BY ServiceName");
    echo json_encode($stmt->fetchAll());
}
?>
