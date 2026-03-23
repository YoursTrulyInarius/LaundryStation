<?php
require_once 'database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM CUSTOMER WHERE CustomerID = ? AND is_deleted = 0");
        $stmt->execute([$_GET['id']]);
        $customer = $stmt->fetch();
        echo json_encode($customer);
    } else if (isset($_GET['search'])) {
        $search = '%' . $_GET['search'] . '%';
        $stmt = $pdo->prepare("SELECT * FROM CUSTOMER WHERE (Name LIKE ? OR ContactNumber LIKE ? OR Address LIKE ?) AND is_deleted = 0 ORDER BY Name");
        $stmt->execute([$search, $search, $search]);
        echo json_encode($stmt->fetchAll());
    } else {
        $stmt = $pdo->query("SELECT * FROM CUSTOMER WHERE is_deleted = 0 ORDER BY Name ASC");
        echo json_encode($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['Name']) || !isset($data['ContactNumber']) || !isset($data['Address'])) {
        http_response_code(400);
        echo json_encode(["error" => "Name, ContactNumber, and Address are required"]);
        exit();
    }
    
    $stmt = $pdo->prepare("INSERT INTO CUSTOMER (Name, ContactNumber, Address) VALUES (?, ?, ?)");
    $success = $stmt->execute([
        $data['Name'], 
        $data['ContactNumber'], 
        $data['Address']
    ]);
    
    if ($success) {
        $id = $pdo->lastInsertId();
        echo json_encode(["success" => true, "CustomerID" => $id]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to add customer"]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['CustomerID']) || !isset($data['Name']) || !isset($data['ContactNumber']) || !isset($data['Address'])) {
        http_response_code(400);
        echo json_encode(["error" => "CustomerID, Name, ContactNumber, and Address are required"]);
        exit();
    }
    
    $stmt = $pdo->prepare("UPDATE CUSTOMER SET Name = ?, ContactNumber = ?, Address = ? WHERE CustomerID = ?");
    $success = $stmt->execute([
        $data['Name'], 
        $data['ContactNumber'], 
        $data['Address'],
        $data['CustomerID']
    ]);
    
    if ($success) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update customer"]);
    }
} elseif ($method === 'DELETE') {
    $stmt = $pdo->prepare("UPDATE CUSTOMER SET is_deleted = 1, deleted_at = NOW() WHERE CustomerID = ?");
    $success = $stmt->execute([$_GET['id']]);
    
    if ($success) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete customer"]);
    }
}
?>
