IF DB_ID('BUSGO') IS NOT NULL
BEGIN
    ALTER DATABASE BUSGO SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE BUSGO;
END
GO

CREATE DATABASE BUSGO;
GO

USE BUSGO;
GO

-- ================= USERS =================
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(150) NOT NULL,
    phoneNumber VARCHAR(15) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar NVARCHAR(255),
    role VARCHAR(20) NOT NULL 
        CHECK (role IN ('customer','partner','admin')),
    companyAddress NVARCHAR(MAX),
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- ================= VEHICLES =================
CREATE TABLE Vehicles (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    type NVARCHAR(50),
    numberOfFloors INT DEFAULT 1,
    partnerId INT NOT NULL,
    licensePlate VARCHAR(20) UNIQUE,
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (partnerId) REFERENCES Users(id)
);

-- ================= WALLET =================
CREATE TABLE Wallets (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT UNIQUE,
    balance DECIMAL(12,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'VND',
    isLocked BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- ================= TRANSACTIONS =================
CREATE TABLE Transactions (
    id INT PRIMARY KEY IDENTITY(1,1),
    walletId INT,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL 
        CHECK (type IN ('TOPUP','PAYMENT','REFUND','WITHDRAW')),
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING','SUCCESS','FAILED')),
    description NVARCHAR(255),
    referenceId VARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (walletId) REFERENCES Wallets(id) ON DELETE CASCADE
);

-- ================= STATIONS =================
CREATE TABLE Stations (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(150) NOT NULL,
    address NVARCHAR(MAX),
    province NVARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE()
);

-- ================= POINTS =================
CREATE TABLE Points (
    id INT PRIMARY KEY IDENTITY(1,1),
    address NVARCHAR(MAX) NOT NULL,
    stationId INT,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (stationId) REFERENCES Stations(id) ON DELETE CASCADE
);

-- ================= TRIPS =================
CREATE TABLE Trips (
    id INT PRIMARY KEY IDENTITY(1,1),
    fromStationId INT,
    toStationId INT,
    vehicleId INT,
    startTime DATETIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    estimatedDuration INT,
    imageUrl NVARCHAR(500),
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (fromStationId) REFERENCES Stations(id),
    FOREIGN KEY (toStationId) REFERENCES Stations(id),
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(id)
);

-- ================= SEATS =================
CREATE TABLE Seats (
    id INT PRIMARY KEY IDENTITY(1,1),
    vehicleId INT,
    name VARCHAR(10) NOT NULL,
    floor INT DEFAULT 1,
    type VARCHAR(20) DEFAULT 'NORMAL' 
        CHECK (type IN ('NORMAL','VIP','COUPLE')),
    status VARCHAR(20) DEFAULT 'AVAILABLE'
        CHECK (status IN ('AVAILABLE','BOOKED','MAINTENANCE')),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE CASCADE
);

-- ================= TICKETS =================
CREATE TABLE Tickets (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT,
    tripId INT,
    seatId INT,
    note NVARCHAR(MAX),
    status VARCHAR(20) DEFAULT 'BOOKED'
        CHECK (status IN ('BOOKED','PAID','CANCELLED','USED')),
    totalAmount DECIMAL(10,2) NOT NULL,
    paymentMethod VARCHAR(20)
        CHECK (paymentMethod IN ('WALLET','CASH','BANKING')),
    transactionId INT,
    bookedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (tripId) REFERENCES Trips(id),
    FOREIGN KEY (seatId) REFERENCES Seats(id),
    FOREIGN KEY (transactionId) REFERENCES Transactions(id)
);

-- ================= REFUNDS =================
CREATE TABLE Refunds (
    id INT PRIMARY KEY IDENTITY(1,1),
    ticketId INT,
    userId INT,
    amount DECIMAL(12,2) NOT NULL,
    reason NVARCHAR(MAX),
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    processedAt DATETIME,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ticketId) REFERENCES Tickets(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- ================= VEHICLE IMAGES =================
CREATE TABLE ImageVehicles (
    id INT PRIMARY KEY IDENTITY(1,1),
    vehicleId INT,
    imageUrl NVARCHAR(255) NOT NULL,
    isPrimary BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE CASCADE
);

-- ================= TIME POINTS =================
CREATE TABLE TimePoints (
    id INT PRIMARY KEY IDENTITY(1,1),
    tripId INT,
    pointId INT,
    arrivalTime TIME NOT NULL,
    departureTime TIME NOT NULL,
    stopDuration INT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (tripId) REFERENCES Trips(id) ON DELETE CASCADE,
    FOREIGN KEY (pointId) REFERENCES Points(id)
);

-- ================= TICKET PASSENGERS =================
CREATE TABLE TicketPassengers (
    id INT PRIMARY KEY IDENTITY(1,1),
    ticketId INT,
    fullName NVARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15),
    email VARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ticketId) REFERENCES Tickets(id) ON DELETE CASCADE
);

INSERT INTO Users (name, phoneNumber, email, password, avatar, role, companyAddress)
VALUES
-- ADMIN
(N'Nguyễn Admin', '0900000001', 'admin@busgo.vn', '123456', NULL, 'admin', NULL),

-- PARTNER (có companyAddress)
(N'Nhà xe Hoàng Long', '0900000002', 'partner@busgo.vn', '123456', NULL, 'partner', 
 N'123 Đường Giải Phóng, Hà Nội'),

-- CUSTOMER
(N'Trần Văn A', '0900000003', 'customer@busgo.vn', '123456', NULL, 'customer', NULL);
