<?php
require_once 'database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method === 'GET') {
    $reports = [];
    
    // Weekly Sales (Last 7 Days including today)
    $stmt = $pdo->query("
        SELECT COALESCE(SUM(TotalAmount), 0) as total
        FROM `TRANSACTION`
        WHERE TransactionDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    ");
    $reports['weekly_sales'] = $stmt->fetchColumn();

    // Monthly Sales (Current Month)
    $stmt = $pdo->query("
        SELECT COALESCE(SUM(TotalAmount), 0) as total
        FROM `TRANSACTION`
        WHERE YEAR(TransactionDate) = YEAR(CURDATE()) 
          AND MONTH(TransactionDate) = MONTH(CURDATE())
    ");
    $reports['monthly_sales'] = $stmt->fetchColumn();

    // Annual Sales (Current Year)
    $stmt = $pdo->query("
        SELECT COALESCE(SUM(TotalAmount), 0) as total
        FROM `TRANSACTION`
        WHERE YEAR(TransactionDate) = YEAR(CURDATE())
    ");
    $reports['annual_sales'] = $stmt->fetchColumn();

    echo json_encode($reports);
}
?>
