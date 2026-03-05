<?php
require_once 'database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method === 'GET') {
    $period = isset($_GET['period']) ? $_GET['period'] : 'weekly';
    
    // Set proper headers to force download
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="sales_report_' . $period . '_' . date('Y-m-d') . '.csv"');
    
    // Create a file pointer connected to the output stream
    $output = fopen('php://output', 'w');
    
    // Output the column headings
    fputcsv($output, array('Transaction ID', 'Customer Name', 'Date', 'Amount', 'Payment Status', 'Laundry Status'));
    
    $query = "
        SELECT t.TransactionID, c.Name as CustomerName, t.TransactionDate, t.TotalAmount, t.PaymentStatus, t.LaundryStatus
        FROM `TRANSACTION` t
        JOIN CUSTOMER c ON t.CustomerID = c.CustomerID
    ";
    
    if ($period === 'weekly') {
        $query .= " WHERE t.TransactionDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    } else if ($period === 'monthly') {
        $query .= " WHERE YEAR(t.TransactionDate) = YEAR(CURDATE()) AND MONTH(t.TransactionDate) = MONTH(CURDATE())";
    } else if ($period === 'annual') {
        $query .= " WHERE YEAR(t.TransactionDate) = YEAR(CURDATE())";
    }
    
    $query .= " ORDER BY t.TransactionDate DESC";
    
    $stmt = $pdo->query($query);
    
    // Output the rows
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, array(
            $row['TransactionID'],
            $row['CustomerName'],
            $row['TransactionDate'],
            number_format((float)$row['TotalAmount'], 2, '.', ''),
            $row['PaymentStatus'],
            $row['LaundryStatus']
        ));
    }
    
    fclose($output);
    exit();
}
?>
