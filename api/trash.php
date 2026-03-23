<?php
require_once 'database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 30-day Auto-Cleanup
if ($method === 'GET') {
    $pdo->query("DELETE FROM CUSTOMER WHERE is_deleted = 1 AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $pdo->query("DELETE FROM `TRANSACTION` WHERE is_deleted = 1 AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
    
    $type = $_GET['type'] ?? 'all';
    $results = [];

    if ($type === 'all' || $type === 'customer') {
        $stmt = $pdo->query("SELECT *, 'customer' as type FROM CUSTOMER WHERE is_deleted = 1 ORDER BY deleted_at DESC");
        $results = array_merge($results, $stmt->fetchAll());
    }

    if ($type === 'all' || $type === 'transaction') {
        $stmt = $pdo->query("
            SELECT t.*, c.Name as CustomerName, 'transaction' as type 
            FROM `TRANSACTION` t
            JOIN CUSTOMER c ON t.CustomerID = c.CustomerID
            WHERE t.is_deleted = 1 
            ORDER BY t.deleted_at DESC
        ");
        $results = array_merge($results, $stmt->fetchAll());
    }

    echo json_encode($results);
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['id']) || !isset($data['type'])) {
        http_response_code(400);
        echo json_encode(["error" => "ID and type are required"]);
        exit();
    }
    
    $id = $data['id'];
    $type = $data['type'];
    
    if ($type === 'customer') {
        $stmt = $pdo->prepare("UPDATE CUSTOMER SET is_deleted = 0, deleted_at = NULL WHERE CustomerID = ?");
    } elseif ($type === 'transaction') {
        $stmt = $pdo->prepare("UPDATE `TRANSACTION` SET is_deleted = 0, deleted_at = NULL WHERE TransactionID = ?");
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid type"]);
        exit();
    }
    
    if ($stmt->execute([$id])) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to restore record"]);
    }
} elseif ($method === 'DELETE') {
    if (!isset($_GET['id']) || !isset($_GET['type'])) {
        http_response_code(400);
        echo json_encode(["error" => "ID and type are required"]);
        exit();
    }
    
    $id = $_GET['id'];
    $type = $_GET['type'];
    
    if ($type === 'customer') {
        $stmtDeleteDetails = $pdo->prepare("DELETE FROM TRANSACTION_DETAIL WHERE TransactionID IN (SELECT TransactionID FROM `TRANSACTION` WHERE CustomerID = ?)");
        $stmtDeleteDetails->execute([$id]);
        $stmtDeleteTransactions = $pdo->prepare("DELETE FROM `TRANSACTION` WHERE CustomerID = ?");
        $stmtDeleteTransactions->execute([$id]);
        $stmt = $pdo->prepare("DELETE FROM CUSTOMER WHERE CustomerID = ?");
    } elseif ($type === 'transaction') {
        $stmtDeleteDetails = $pdo->prepare("DELETE FROM TRANSACTION_DETAIL WHERE TransactionID = ?");
        $stmtDeleteDetails->execute([$id]);
        $stmt = $pdo->prepare("DELETE FROM `TRANSACTION` WHERE TransactionID = ?");
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid type"]);
        exit();
    }
    
    if ($stmt->execute([$id])) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete record permanently"]);
    }
}
?>
