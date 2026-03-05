<?php
require_once 'database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method === 'GET') {
    $dashboard = [];
    
    // Total Revenue & Transactions Today
    $stmt = $pdo->query("
        SELECT COUNT(*) as total_transactions, SUM(TotalAmount) as total_revenue
        FROM `TRANSACTION`
        WHERE TransactionDate = CURDATE()
    ");
    $dashboard['summary'] = $stmt->fetch();
    
    // Pending Pickup Orders
    $stmt = $pdo->query("
        SELECT t.*, c.Name as CustomerName 
        FROM `TRANSACTION` t
        JOIN CUSTOMER c ON t.CustomerID = c.CustomerID
        WHERE t.LaundryStatus != 'Completed' AND t.PickupDate IS NOT NULL
        ORDER BY t.PickupDate ASC, t.PickupTime ASC
        LIMIT 10
    ");
    $dashboard['pending_orders'] = $stmt->fetchAll();

    // Active Services List
    $stmt = $pdo->query("SELECT ServiceName FROM `LAUNDRY_SERVICE`");
    $dashboard['services'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode($dashboard);
}
?>
