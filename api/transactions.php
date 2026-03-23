<?php
require_once 'database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("
            SELECT t.*, c.Name as CustomerName, c.ContactNumber 
            FROM `TRANSACTION` t
            JOIN CUSTOMER c ON t.CustomerID = c.CustomerID
            WHERE t.TransactionID = ? AND t.is_deleted = 0
        ");
        $stmt->execute([$_GET['id']]);
        $transaction = $stmt->fetch();
        
        if ($transaction) {
            $stmtItems = $pdo->prepare("
                SELECT ti.*, s.ServiceName 
                FROM TRANSACTION_DETAIL ti
                JOIN LAUNDRY_SERVICE s ON ti.ServiceID = s.ServiceID
                WHERE ti.TransactionID = ?
            ");
            $stmtItems->execute([$transaction['TransactionID']]);
            $transaction['items'] = $stmtItems->fetchAll();
            echo json_encode($transaction);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Transaction not found"]);
        }
    } else {
        $stmt = $pdo->query("
            SELECT t.*, c.Name as CustomerName 
            FROM `TRANSACTION` t
            JOIN CUSTOMER c ON t.CustomerID = c.CustomerID
            WHERE t.is_deleted = 0
            ORDER BY t.TransactionDate DESC, t.TransactionID DESC
            LIMIT 50
        ");
        echo json_encode($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['CustomerID']) || empty($data['items'])) {
        http_response_code(400);
        echo json_encode(["error" => "Customer and items are required"]);
        exit();
    }
    
    try {
        $pdo->beginTransaction();
        
        $totalAmount = 0;
        foreach($data['items'] as $item) {
            $totalAmount += $item['Subtotal'];
        }
        
        $transactionDate = $data['TransactionDate'] ?? date('Y-m-d');
        
        $stmt = $pdo->prepare("
            INSERT INTO `TRANSACTION` (CustomerID, TotalAmount, TransactionDate, PaymentStatus, LaundryStatus, PickupDate, PickupTime) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['CustomerID'],
            $totalAmount,
            $transactionDate,
            $data['PaymentStatus'] ?? 'Pending',
            $data['LaundryStatus'] ?? 'Received',
            $data['PickupDate'] ?? null,
            $data['PickupTime'] ?? null
        ]);
        
        $transactionId = $pdo->lastInsertId();
        
        $stmtItem = $pdo->prepare("
            INSERT INTO TRANSACTION_DETAIL (TransactionID, ServiceID, Quantity, Subtotal) 
            VALUES (?, ?, ?, ?)
        ");
        
        foreach($data['items'] as $item) {
            $stmtItem->execute([
                $transactionId,
                $item['ServiceID'],
                $item['Quantity'],
                $item['Subtotal']
            ]);
        }
        
        $pdo->commit();
        echo json_encode(["success" => true, "TransactionID" => $transactionId]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Transaction failed: " . $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['TransactionID']) || !isset($data['PaymentStatus'])) {
        http_response_code(400);
        echo json_encode(["error" => "TransactionID and PaymentStatus are required"]);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE `TRANSACTION` SET PaymentStatus = ? WHERE TransactionID = ?");
        $stmt->execute([$data['PaymentStatus'], $data['TransactionID']]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Update failed: " . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "TransactionID is required"]);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE `TRANSACTION` SET is_deleted = 1, deleted_at = NOW() WHERE TransactionID = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Delete failed: " . $e->getMessage()]);
    }
}
?>
