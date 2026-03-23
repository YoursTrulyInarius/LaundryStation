-- Create Database
CREATE DATABASE IF NOT EXISTS laundry_station
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE laundry_station;

-- ============================================================
-- TABLES - STRICT PRD COMPLIANCE
-- ============================================================

-- 1. CUSTOMER TABLE
CREATE TABLE CUSTOMER (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    ContactNumber VARCHAR(15) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. LAUNDRY_SERVICE TABLE
CREATE TABLE LAUNDRY_SERVICE (
    ServiceID INT PRIMARY KEY AUTO_INCREMENT,
    ServiceName VARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TRANSACTION TABLE
CREATE TABLE `TRANSACTION` (
    TransactionID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    TransactionDate DATE NOT NULL,
    PaymentStatus VARCHAR(20) NOT NULL,
    LaundryStatus VARCHAR(20) NOT NULL,
    PickupDate DATE,
    PickupTime TIME,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (CustomerID) REFERENCES CUSTOMER(CustomerID) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TRANSACTION_DETAIL TABLE
CREATE TABLE TRANSACTION_DETAIL (
    TransactionDetailID INT PRIMARY KEY AUTO_INCREMENT,
    TransactionID INT NOT NULL,
    ServiceID INT NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (TransactionID) REFERENCES `TRANSACTION`(TransactionID) ON DELETE CASCADE,
    FOREIGN KEY (ServiceID) REFERENCES LAUNDRY_SERVICE(ServiceID) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. USERS TABLE (As requested: only keep Admins/Staff)
CREATE TABLE USERS (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Admin / Owner', 'Laundry Staff / Cashier') NOT NULL,
    Phone VARCHAR(15),
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default users
INSERT INTO USERS (Username, PasswordHash, Role) VALUES
('admin', '$2y$10$YourHashedPasswordHere', 'Admin / Owner'),
('staff', '$2y$10$YourHashedPasswordHere', 'Laundry Staff / Cashier');

-- Insert initial services (based on typical laundry)
INSERT INTO LAUNDRY_SERVICE (ServiceName, Price) VALUES
('WASH & FOLD', 80.00),
('DRY CLEAN', 150.00),
('WASH & IRON', 100.00),
('IRON ONLY', 50.00);