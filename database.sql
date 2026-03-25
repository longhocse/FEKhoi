IF DB_ID('BUSGO') IS NOT NULL BEGIN ALTER DATABASE BUSGO
SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE BUSGO;
END
CREATE DATABASE BUSGO;
USE BUSGO;
GO -- ================= USERS =================
    CREATE TABLE Users (
        id INT PRIMARY KEY IDENTITY(1, 1),
        name NVARCHAR(150) NOT NULL,
        phoneNumber VARCHAR(15) UNIQUE,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar NVARCHAR(255),
        role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'partner', 'admin')),
        companyAddress NVARCHAR(MAX),
        isActive BIT DEFAULT 1,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
    );

	-- Passenger Car Companies
CREATE TABLE PassengerCarCompanies (
    id INT IDENTITY(1, 1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    phone NVARCHAR(15),
    email NVARCHAR(100),
    address NVARCHAR(MAX),
    taxCode NVARCHAR(20),
    logo NVARCHAR(255),
    isActive BIT DEFAULT 1,
    verifiedAt DATETIME NULL,
    createdAt DATETIME DEFAULT GETDATE()
);
-- ================= VEHICLES =================
CREATE TABLE Vehicles (
    id INT PRIMARY KEY IDENTITY(1, 1),
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
    id INT PRIMARY KEY IDENTITY(1, 1),
    userId INT UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'VND',
    isLocked BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
-- ================= TRANSACTIONS =================
CREATE TABLE Transactions (
    id INT PRIMARY KEY IDENTITY(1, 1),
    walletId INT,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('TOPUP', 'PAYMENT', 'REFUND', 'WITHDRAW')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    description NVARCHAR(255),
    referenceId VARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (walletId) REFERENCES Wallets(id) ON DELETE CASCADE
);
-- ================= STATIONS =================
CREATE TABLE Stations (
    id INT PRIMARY KEY IDENTITY(1, 1),
    name NVARCHAR(150) NOT NULL,
    address NVARCHAR(MAX),
    province NVARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE()
);
-- ================= POINTS =================
CREATE TABLE Points (
    id INT PRIMARY KEY IDENTITY(1, 1),
    address NVARCHAR(MAX) NOT NULL,
    stationId INT,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (stationId) REFERENCES Stations(id) ON DELETE CASCADE
);
-- ================= TRIPS =================
CREATE TABLE Trips (
    id INT PRIMARY KEY IDENTITY(1, 1),
    fromStationId INT,
    toStationId INT,
    vehicleId INT,
    startTime DATETIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
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
    id INT PRIMARY KEY IDENTITY(1, 1),
    vehicleId INT,
    name VARCHAR(10) NOT NULL,
    floor INT DEFAULT 1,
    type VARCHAR(20) DEFAULT 'NORMAL' CHECK (type IN ('NORMAL', 'VIP', 'COUPLE')),
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED', 'MAINTENANCE')),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE CASCADE
);
-- ================= TICKETS =================
CREATE TABLE Tickets (
    id INT PRIMARY KEY IDENTITY(1, 1),
    userId INT,
    tripId INT,
    seatId INT,
    note NVARCHAR(MAX),
    status VARCHAR(20) DEFAULT 'BOOKED' CHECK (status IN ('BOOKED', 'PAID', 'CANCELLED', 'USED')),
    totalAmount DECIMAL(10, 2) NOT NULL,
    paymentMethod VARCHAR(20) CHECK (paymentMethod IN ('WALLET', 'CASH', 'BANKING')),
    transactionId INT,
    bookedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (tripId) REFERENCES Trips(id),
    FOREIGN KEY (seatId) REFERENCES Seats(id),
    FOREIGN KEY (transactionId) REFERENCES Transactions(id)
);
-- ================= REFUNDS =================
CREATE TABLE Refunds (
    id INT PRIMARY KEY IDENTITY(1, 1),
    ticketId INT,
    userId INT,
    amount DECIMAL(12, 2) NOT NULL,
    reason NVARCHAR(MAX),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    processedAt DATETIME,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ticketId) REFERENCES Tickets(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);
-- ================= VEHICLE IMAGES =================
CREATE TABLE ImageVehicles (
    id INT PRIMARY KEY IDENTITY(1, 1),
    vehicleId INT,
    imageUrl NVARCHAR(255) NOT NULL,
    isPrimary BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE CASCADE
);
-- ================= TIME POINTS =================
CREATE TABLE TimePoints (
    id INT PRIMARY KEY IDENTITY(1, 1),
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
    id INT PRIMARY KEY IDENTITY(1, 1),
    ticketId INT,
    fullName NVARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15),
    email VARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ticketId) REFERENCES Tickets(id) ON DELETE CASCADE
);

-- Bảng đánh giá chuyến xe
CREATE TABLE TripReviews (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    tripId INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX),
    images NVARCHAR(MAX), -- Lưu JSON hoặc đường dẫn ảnh
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (tripId) REFERENCES Trips(id)
);

-- Bảng đánh giá nhà xe
CREATE TABLE CompanyReviews (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    companyId INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX),
    images NVARCHAR(MAX),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (companyId) REFERENCES PassengerCarCompanies(id)
);



-- Tạo index
CREATE INDEX IX_TripReviews_TripId ON TripReviews(tripId);
CREATE INDEX IX_TripReviews_UserId ON TripReviews(userId);
CREATE INDEX IX_CompanyReviews_CompanyId ON CompanyReviews(companyId);

GO


-- Bảng khuyến mãi (Promotions)
CREATE TABLE Promotions (
    id INT PRIMARY KEY IDENTITY(1,1),
    code NVARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    discountType VARCHAR(20) NOT NULL CHECK (discountType IN ('PERCENT', 'FIXED')),
    discountValue DECIMAL(10,2) NOT NULL,
    minOrderValue DECIMAL(10,2) DEFAULT 0,
    maxDiscount DECIMAL(10,2) NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    usageLimit INT DEFAULT 1,
    usedCount INT DEFAULT 0,
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng lưu lịch sử sử dụng khuyến mãi
CREATE TABLE PromotionUsage (
    id INT PRIMARY KEY IDENTITY(1,1),
    promotionId INT NOT NULL,
    userId INT NOT NULL,
    ticketId INT NOT NULL,
    discountAmount DECIMAL(10,2) NOT NULL,
    usedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (promotionId) REFERENCES Promotions(id),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (ticketId) REFERENCES Tickets(id)
);

-- Index
CREATE INDEX IX_Promotions_Code ON Promotions(code);
CREATE INDEX IX_Promotions_Date ON Promotions(startDate, endDate);
CREATE INDEX IX_PromotionUsage_UserId ON PromotionUsage(userId);


-- Xóa bảng cũ nếu tồn tại
DROP TABLE IF EXISTS Reports;

-- Tạo bảng Reports mới (không có fromStation, toStation)
CREATE TABLE Reports (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    ticketId INT NULL,
    tripId INT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('TECHNICAL', 'SERVICE', 'PAYMENT', 'OTHER')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'RESOLVED', 'CLOSED')),
    adminNote NVARCHAR(MAX) NULL,
    resolvedAt DATETIME NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (ticketId) REFERENCES Tickets(id),
    FOREIGN KEY (tripId) REFERENCES Trips(id)
);


-- 1. Thêm cột refundPercentage
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Refunds' AND COLUMN_NAME = 'refundPercentage')
BEGIN
    ALTER TABLE Refunds ADD refundPercentage INT NULL;
    PRINT '✅ Đã thêm cột refundPercentage';
END
ELSE
BEGIN
    PRINT 'ℹ️ Cột refundPercentage đã tồn tại';
END

-- 2. Thêm cột adminNote
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Refunds' AND COLUMN_NAME = 'adminNote')
BEGIN
    ALTER TABLE Refunds ADD adminNote NVARCHAR(MAX) NULL;
    PRINT '✅ Đã thêm cột adminNote';
END
ELSE
BEGIN
    PRINT 'ℹ️ Cột adminNote đã tồn tại';
END


GO
INSERT INTO Users (
        name,
        phoneNumber,
        email,
        password,
        avatar,
        role,
        companyAddress
    )
VALUES -- ADMIN
    (
        N'Nguyễn Admin',
        '0900000001',
        'admin@busgo.vn',
        '123456',
        NULL,
        'admin',
        NULL
    ),
    -- PARTNER (có companyAddress)
    (
        N'Nhà xe Hoàng Long',
        '0900000002',
        'partner@busgo.vn',
        '123456',
        NULL,
        'partner',
        N'123 Đường Giải Phóng, Hà Nội'
    ),
    -- CUSTOMER
    (
        N'Trần Văn A',
        '0900000003',
        'customer@busgo.vn',
        '123456',
        NULL,
        'customer',
        NULL
    );
INSERT INTO Vehicles (
        name,
        description,
        type,
        numberOfFloors,
        partnerId,
        licensePlate
    )
VALUES (
        N'Xe giường nằm 40 chỗ',
        N'Xe giường nằm cao cấp, có wifi và điều hòa',
        N'SLEEPER',
        1,
        2,
        '29B-12345'
    );
INSERT INTO Wallets (userId, balance)
VALUES (2, 0),
    -- wallet partner
    (3, 1000000);
-- wallet customer
INSERT INTO Stations (name, address, province)
VALUES (
        N'Bến xe Giáp Bát',
        N'Giải Phóng, Hà Nội',
        N'Hà Nội'
    ),
    (
        N'Bến xe Đà Nẵng',
        N'Tôn Đức Thắng, Đà Nẵng',
        N'Đà Nẵng'
    );
INSERT INTO Trips (
        fromStationId,
        toStationId,
        vehicleId,
        startTime,
        price,
        estimatedDuration
    )
VALUES (1, 2, 1, '2026-03-10 08:00:00', 350000, 900);
INSERT INTO Seats (name, vehicleId, floor, type, status)
VALUES
('A1',1,1,'VIP','AVAILABLE'),
('A2',1,1,'VIP','AVAILABLE'),
('A3',1,1,'VIP','AVAILABLE'),
('A4',1,1,'VIP','AVAILABLE'),
('B1',1,1,'NORMAL','AVAILABLE'),
('B2',1,1,'NORMAL','AVAILABLE'),
('B3',1,1,'NORMAL','AVAILABLE'),
('B4',1,1,'NORMAL','AVAILABLE'),
('C1',1,1,'NORMAL','AVAILABLE'),
('C2',1,1,'NORMAL','AVAILABLE'),
('C3',1,1,'NORMAL','AVAILABLE'),
('C4',1,1,'NORMAL','AVAILABLE'),
('D1',1,1,'NORMAL','AVAILABLE'),
('D2',1,1,'NORMAL','AVAILABLE'),
('D3',1,1,'NORMAL','AVAILABLE'),
('D4',1,1,'NORMAL','AVAILABLE'),
('E1',1,1,'NORMAL','AVAILABLE'),
('E2',1,1,'NORMAL','AVAILABLE'),
('E3',1,1,'NORMAL','AVAILABLE'),
('E4',1,1,'NORMAL','AVAILABLE'),
('F1',1,1,'NORMAL','AVAILABLE'),
('F2',1,1,'NORMAL','AVAILABLE'),
('F3',1,1,'NORMAL','AVAILABLE'),
('F4',1,1,'NORMAL','AVAILABLE'),
('G1',1,1,'NORMAL','AVAILABLE'),
('G2',1,1,'NORMAL','AVAILABLE'),
('G3',1,1,'NORMAL','AVAILABLE'),
('G4',1,1,'NORMAL','AVAILABLE');
INSERT INTO Transactions (walletId, amount, type, status, description)
VALUES (
        2,
        350000,
        'PAYMENT',
        'SUCCESS',
        N'Thanh toán vé Hà Nội - Đà Nẵng'
    );
INSERT INTO Tickets (
        userId,
        tripId,
        seatId,
        totalAmount,
        paymentMethod,
        transactionId,
        status
    )
VALUES (3, 1, 1, 350000, 'WALLET', 1, 'PAID');
INSERT INTO TicketPassengers (ticketId, fullName, phoneNumber, email)
VALUES (
        1,
        N'Trần Văn A',
        '0900000003',
        'customer@busgo.vn'
    );
INSERT INTO Points (address, stationId)
VALUES (N'Thành phố Vinh', 1);
select *
from Users;
select *
from Vehicles;
-- Create indexes for performance
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Role ON Users(role);
CREATE INDEX IX_Trips_StartTime ON Trips(startTime);
CREATE INDEX IX_Tickets_Status ON Tickets(status);
CREATE INDEX IX_Tickets_UserId ON Tickets(userId);
CREATE INDEX IX_Tickets_TripId ON Tickets(tripId);
GO
INSERT INTO Users (
        name,
        phoneNumber,
        email,
        password,
        avatar,
        role,
        companyAddress,
        isActive
    )
VALUES -- Thêm Admin
    (
        N'Admin System',
        '0900000100',
        'system@busgo.vn',
        '123456',
        NULL,
        'admin',
        NULL,
        1
    ),
    -- Thêm Partners (Nhà xe)
    (
        N'Xe khách Hải Âu',
        '0900000101',
        'haiau@busgo.vn',
        '123456',
        NULL,
        'partner',
        N'15 Lê Lợi, Quận 1, TP HCM',
        1
    ),
    (
        N'Xe Phương Trang',
        '0900000102',
        'phuongtrang@busgo.vn',
        '123456',
        NULL,
        'partner',
        N'102 Trần Hưng Đạo, Quận 5, TP HCM',
        1
    ),
    (
        N'Xe Thành Bưởi',
        '0900000103',
        'thanhbuoi@busgo.vn',
        '123456',
        NULL,
        'partner',
        N'45 Nguyễn Trãi, Quận 1, TP HCM',
        1
    ),
    (
        N'Xe Sao Việt',
        '0900000104',
        'saoviet@busgo.vn',
        '123456',
        NULL,
        'partner',
        N'123 Cầu Giấy, Hà Nội',
        1
    ),
    (
        N'Xe Hải Vân',
        '0900000105',
        'haivan@busgo.vn',
        '123456',
        NULL,
        'partner',
        N'56 Nguyễn Văn Linh, Đà Nẵng',
        1
    ),
    -- Thêm Customers (khách hàng)
    (
        N'Nguyễn Văn Bình',
        '0912345688',
        'binh.nguyen@gmail.com',
        '123456',
        NULL,
        'customer',
        NULL,
        1
    ),
    (
        N'Phạm Thị Cúc',
        '0912345689',
        'cuc.pham@gmail.com',
        '123456',
        NULL,
        'customer',
        NULL,
        1
    ),
    (
        N'Hoàng Văn Dũng',
        '0912345690',
        'dung.hoang@gmail.com',
        '123456',
        NULL,
        'customer',
        NULL,
        1
    ),
    (
        N'Đỗ Thị Em',
        '0912345691',
        'em.do@gmail.com',
        '123456',
        NULL,
        'customer',
        NULL,
        1
    ),
    (
        N'Vũ Văn Phúc',
        '0912345692',
        'phuc.vu@gmail.com',
        '123456',
        NULL,
        'customer',
        NULL,
        1
    ),
    (
        N'Ngô Thị Hồng',
        '0912345693',
        'hong.ngo@gmail.com',
        '123456',
        NULL,
        'customer',
        NULL,
        1
    ),
    (
        N'Đinh Văn Hùng',
        '0912345694',
        'hung.dinh@gmail.com',
        '123456',
        NULL,
        'customer',
        NULL,
        1
    );
GO -- ================= THÊM PASSENGER CAR COMPANIES =================
INSERT INTO PassengerCarCompanies (
        name,
        phone,
        email,
        address,
        taxCode,
        logo,
        isActive,
        verifiedAt
    )
VALUES (
        N'Xe khách Hải Âu',
        '0281234567',
        'haiau@busgo.vn',
        N'15 Lê Lợi, Quận 1, TP HCM',
        '0101234567',
        '/logos/haiau.png',
        1,
        GETDATE()
    ),
    (
        N'Xe Phương Trang',
        '0287654321',
        'phuongtrang@busgo.vn',
        N'102 Trần Hưng Đạo, Quận 5, TP HCM',
        '0101234568',
        '/logos/phuongtrang.png',
        1,
        GETDATE()
    ),
    (
        N'Xe Thành Bưởi',
        '0241234567',
        'thanhbuoi@busgo.vn',
        N'45 Nguyễn Trãi, Quận 1, TP HCM',
        '0101234569',
        '/logos/thanhbuoi.png',
        1,
        GETDATE()
    ),
    (
        N'Xe Sao Việt',
        '0249876543',
        'saoviet@busgo.vn',
        N'123 Cầu Giấy, Hà Nội',
        '0101234570',
        '/logos/saoviet.png',
        1,
        GETDATE()
    ),
    (
        N'Xe Hải Vân',
        '0236123456',
        'haivan@busgo.vn',
        N'56 Nguyễn Văn Linh, Đà Nẵng',
        '0101234571',
        '/logos/haivan.png',
        1,
        GETDATE()
    );
GO -- ================= THÊM NHIỀU STATIONS =================
INSERT INTO Stations (name, address, province)
VALUES -- Miền Bắc
    (
        N'Bến xe Mỹ Đình',
        N'Phạm Hùng, Nam Từ Liêm',
        N'Hà Nội'
    ),
    (
        N'Bến xe Gia Lâm',
        N'Ngô Gia Khảm, Long Biên',
        N'Hà Nội'
    ),
    (
        N'Bến xe Lào Cai',
        N'Đường 4B, Phường Kim Tân',
        N'Lào Cai'
    ),
    (
        N'Bến xe Hạ Long',
        N'Bãi Cháy, TP Hạ Long',
        N'Quảng Ninh'
    ),
    (
        N'Bến xe Hải Phòng',
        N'Lạch Tray, Ngô Quyền',
        N'Hải Phòng'
    ),
    (
        N'Bến xe Ninh Bình',
        N'Đinh Tất Miễn, TP Ninh Bình',
        N'Ninh Bình'
    ),
    -- Miền Trung
    (
        N'Bến xe Huế',
        N'An Dương Vương, TP Huế',
        N'Thừa Thiên Huế'
    ),
    (
        N'Bến xe Đồng Hới',
        N'Trần Hưng Đạo, TP Đồng Hới',
        N'Quảng Bình'
    ),
    (
        N'Bến xe Quảng Ngãi',
        N'Quang Trung, TP Quảng Ngãi',
        N'Quảng Ngãi'
    ),
    (
        N'Bến xe Quy Nhơn',
        N'Trần Hưng Đạo, TP Quy Nhơn',
        N'Bình Định'
    ),
    (
        N'Bến xe Nha Trang',
        N'23 Tháng 10, TP Nha Trang',
        N'Khánh Hòa'
    ),
    (
        N'Bến xe Đà Lạt',
        N'3 Tháng 4, TP Đà Lạt',
        N'Lâm Đồng'
    ),
    -- Miền Nam
    (
        N'Bến xe Miền Đông',
        N'Đinh Bộ Lĩnh, Bình Thạnh',
        N'TP HCM'
    ),
    (
        N'Bến xe Miền Tây',
        N'Kinh Dương Vương, Bình Tân',
        N'TP HCM'
    ),
    (
        N'Bến xe Vũng Tàu',
        N'Nam Kỳ Khởi Nghĩa, TP Vũng Tàu',
        N'Bà Rịa - Vũng Tàu'
    ),
    (
        N'Bến xe Cần Thơ',
        N'Nguyễn Trãi, Ninh Kiều',
        N'Cần Thơ'
    );
GO -- ================= THÊM NHIỀU VEHICLES =================
INSERT INTO Vehicles (
        name,
        description,
        type,
        numberOfFloors,
        partnerId,
        licensePlate,
        isActive
    )
VALUES -- Hải Âu (partnerId = 4)
    (
        N'Xe limousine 22 chỗ',
        N'Xe limousine VIP, ghế ngồi bọc da cao cấp',
        'LIMOUSINE',
        1,
        4,
        '51B-12346',
        1
    ),
    -- Phương Trang (partnerId = 5)
    (
        N'Xe giường nằm đôi',
        N'Xe giường đôi, phục vụ 24/24',
        'SLEEPER',
        2,
        5,
        '51B-22345',
        1
    ),
    (
        N'Xe khách 45 chỗ',
        N'Xe khách tiêu chuẩn, giá rẻ',
        'STANDARD',
        1,
        5,
        '51B-22346',
        1
    ),
    -- Thành Bưởi (partnerId = 6)
    (
        N'Xe VIP Thành Bưởi',
        N'Xe VIP sang trọng, có tivi, sạc điện thoại',
        'VIP',
        1,
        6,
        '51B-32345',
        1
    ),
    (
        N'Xe giường nằm đôi',
        N'Xe giường nằm đôi cho cặp đôi',
        'COUPLE',
        2,
        6,
        '51B-32346',
        1
    ),
    -- Sao Việt (partnerId = 7)
    (
        N'Xe Sao Việt VIP',
        N'Xe VIP cao cấp nhất',
        'VIP',
        1,
        7,
        '29B-22345',
        1
    ),
    (
        N'Xe Sao Việt giường nằm',
        N'Xe giường nằm 40 chỗ',
        'SLEEPER',
        2,
        7,
        '29B-22346',
        1
    ),
    -- Hải Vân (partnerId = 8)
    (
        N'Xe Hải Vân',
        N'Xe khách chất lượng cao',
        'STANDARD',
        1,
        8,
        '43B-12345',
        1
    ),
    (
        N'Xe Hải Vân giường nằm',
        N'Xe giường nằm 40 chỗ',
        'SLEEPER',
        2,
        8,
        '43B-12346',
        1
    );
GO -- ================= THÊM WALLETS CHO USER MỚI =================
INSERT INTO Wallets (userId, balance, currency, isLocked)
VALUES (4, 15000000, 'VND', 0),
    -- Hải Âu
    (5, 25000000, 'VND', 0),
    -- Phương Trang
    (6, 18000000, 'VND', 0),
    -- Thành Bưởi
    (7, 9000000, 'VND', 0),
    -- Sao Việt
    (8, 5000000, 'VND', 0),
    -- Hải Vân
    (9, 2000000, 'VND', 0),
    -- Nguyễn Văn Bình
    (10, 3500000, 'VND', 0),
    -- Phạm Thị Cúc
    (11, 500000, 'VND', 0),
    -- Hoàng Văn Dũng
    (12, 4500000, 'VND', 0),
    -- Đỗ Thị Em
    (13, 1200000, 'VND', 0),
    -- Vũ Văn Phúc
    (14, 2800000, 'VND', 0),
    -- Ngô Thị Hồng
    (15, 800000, 'VND', 0);
-- Đinh Văn Hùng
GO -- ================= THÊM NHIỀU TRIPS =================
INSERT INTO Trips (
        fromStationId,
        toStationId,
        vehicleId,
        startTime,
        price,
        estimatedDuration,
        imageUrl,
        isActive
    )
VALUES -- Hà Nội (1) - Đà Nẵng (3)
    (
        1,
        3,
        1,
        '2026-03-10 08:00:00',
        350000,
        540,
        '/images/trips/hanoi-danang-1.jpg',
        1
    ),
    (
        1,
        3,
        1,
        '2026-03-10 20:00:00',
        380000,
        540,
        '/images/trips/hanoi-danang-2.jpg',
        1
    ),
    -- Hà Nội (1) - Hải Phòng (7)
    (
        1,
        7,
        2,
        '2026-03-10 07:00:00',
        120000,
        150,
        '/images/trips/hanoi-haiphong-1.jpg',
        1
    ),
    (
        1,
        7,
        2,
        '2026-03-10 15:30:00',
        120000,
        150,
        '/images/trips/hanoi-haiphong-2.jpg',
        1
    ),
    -- Hà Nội (1) - Sapa (4)
    (
        1,
        4,
        3,
        '2026-03-10 22:00:00',
        250000,
        300,
        '/images/trips/hanoi-sapa-1.jpg',
        1
    ),
    (
        1,
        4,
        3,
        '2026-03-11 22:00:00',
        250000,
        300,
        '/images/trips/hanoi-sapa-2.jpg',
        1
    ),
    -- TP HCM (14) - Đà Lạt (13)
    (
        14,
        13,
        4,
        '2026-03-10 22:00:00',
        280000,
        360,
        '/images/trips/hcm-dalat-1.jpg',
        1
    ),
    (
        14,
        13,
        4,
        '2026-03-11 08:00:00',
        250000,
        360,
        '/images/trips/hcm-dalat-2.jpg',
        1
    ),
    -- TP HCM (14) - Vũng Tàu (16)
    (
        14,
        16,
        5,
        '2026-03-10 06:00:00',
        150000,
        120,
        '/images/trips/hcm-vungtau-1.jpg',
        1
    ),
    (
        14,
        16,
        5,
        '2026-03-10 14:00:00',
        150000,
        120,
        '/images/trips/hcm-vungtau-2.jpg',
        1
    ),
    -- Đà Nẵng (3) - Huế (8)
    (
        3,
        8,
        6,
        '2026-03-10 08:30:00',
        100000,
        150,
        '/images/trips/danang-hue-1.jpg',
        1
    ),
    (
        3,
        8,
        6,
        '2026-03-10 14:30:00',
        100000,
        150,
        '/images/trips/danang-hue-2.jpg',
        1
    ),
    -- Đà Nẵng (3) - Quy Nhơn (11)
    (
        3,
        11,
        7,
        '2026-03-10 20:00:00',
        220000,
        360,
        '/images/trips/danang-quynhon-1.jpg',
        1
    ),
    -- Hà Nội (1) - Quảng Ninh (5)
    (
        1,
        5,
        8,
        '2026-03-10 06:15:00',
        180000,
        180,
        '/images/trips/hanoi-quangninh-1.jpg',
        1
    ),
    (
        1,
        5,
        8,
        '2026-03-10 14:15:00',
        180000,
        180,
        '/images/trips/hanoi-quangninh-2.jpg',
        1
    ),
    -- TP HCM (14) - Cần Thơ (17)
    (
        14,
        17,
        9,
        '2026-03-10 07:00:00',
        180000,
        240,
        '/images/trips/hcm-canTho-1.jpg',
        1
    ),
    (
        14,
        17,
        9,
        '2026-03-10 15:00:00',
        180000,
        240,
        '/images/trips/hcm-canTho-2.jpg',
        1
    ),
    -- Nha Trang (12) - Đà Lạt (13)
    (
        12,
        13,
        10,
        '2026-03-11 08:00:00',
        200000,
        240,
        '/images/trips/nhatrang-dalat-1.jpg',
        1
    );
GO -- ================= THÊM SEATS CHO CÁC XE MỚI =================
DECLARE @VehicleCounter INT = 2;
WHILE @VehicleCounter <= 10 BEGIN -- Tầng 1
INSERT INTO Seats (vehicleId, name, floor, type, status)
VALUES (@VehicleCounter, 'A1', 1, 'VIP', 'AVAILABLE'),
    (@VehicleCounter, 'A2', 1, 'VIP', 'AVAILABLE'),
    (@VehicleCounter, 'A3', 1, 'VIP', 'AVAILABLE'),
    (@VehicleCounter, 'A4', 1, 'VIP', 'AVAILABLE'),
    (@VehicleCounter, 'B1', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'B2', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'B3', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'B4', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'C1', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'C2', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'C3', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'C4', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'D1', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'D2', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'D3', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'D4', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'E1', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'E2', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'E3', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'E4', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'F1', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'F2', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'F3', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'F4', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'G1', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'G2', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'G3', 1, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'G4', 1, 'NORMAL', 'AVAILABLE');
-- Nếu xe có 2 tầng (SLEEPER hoặc COUPLE)
IF @VehicleCounter IN (3, 5, 7, 9) BEGIN
INSERT INTO Seats (vehicleId, name, floor, type, status)
VALUES (@VehicleCounter, 'E1', 2, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'E2', 2, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'F1', 2, 'NORMAL', 'AVAILABLE'),
    (@VehicleCounter, 'F2', 2, 'NORMAL', 'AVAILABLE');
END
SET @VehicleCounter = @VehicleCounter + 1;
END
GO -- ================= THÊM IMAGE VEHICLES =================
INSERT INTO ImageVehicles (vehicleId, imageUrl, isPrimary)
VALUES (2, '/images/vehicles/haiau-limousine-1.jpg', 1),
    (
        3,
        '/images/vehicles/phuongtrang-sleeper-1.jpg',
        1
    ),
    (
        4,
        '/images/vehicles/phuongtrang-standard-1.jpg',
        1
    ),
    (5, '/images/vehicles/thanhbuoi-vip-1.jpg', 1),
    (6, '/images/vehicles/thanhbuoi-couple-1.jpg', 1),
    (7, '/images/vehicles/saoviet-vip-1.jpg', 1),
    (8, '/images/vehicles/saoviet-sleeper-1.jpg', 1),
    (9, '/images/vehicles/haivan-standard-1.jpg', 1),
    (10, '/images/vehicles/haivan-sleeper-1.jpg', 1);
GO -- ================= THÊM POINTS =================
INSERT INTO Points (address, stationId)
VALUES (N'Thanh Hóa', 1),
    (N'Vinh, Nghệ An', 1),
    (N'Hà Tĩnh', 1),
    (N'Đồng Hới, Quảng Bình', 1),
    (N'Đông Hà, Quảng Trị', 3),
    (N'Huế', 3),
    (N'Bảo Lộc, Lâm Đồng', 14),
    (N'Long Thành, Đồng Nai', 14),
    (N'Bà Rịa', 16),
    (N'Việt Trì, Phú Thọ', 1);
GO -- ================= THÊM TIME POINTS CHO CÁC TRIP MỚI =================
    -- Trip 2 (Hà Nội - Đà Nẵng đêm)
INSERT INTO TimePoints (
        tripId,
        pointId,
        arrivalTime,
        departureTime,
        stopDuration
    )
VALUES (2, 5, '22:30:00', '22:45:00', 15),
    (2, 6, '00:30:00', '00:45:00', 15),
    (2, 7, '02:30:00', '02:45:00', 15),
    (2, 8, '04:30:00', '04:45:00', 15),
    (2, 9, '06:30:00', '06:45:00', 15),
    (2, 10, '08:30:00', '08:45:00', 15);
-- Trip 5 (Hà Nội - Sapa)
INSERT INTO TimePoints (
        tripId,
        pointId,
        arrivalTime,
        departureTime,
        stopDuration
    )
VALUES (5, 14, '00:30:00', '00:45:00', 15),
    (5, 5, '02:30:00', '02:45:00', 15);
-- Trip 7 (TP HCM - Đà Lạt)
INSERT INTO TimePoints (
        tripId,
        pointId,
        arrivalTime,
        departureTime,
        stopDuration
    )
VALUES (7, 11, '00:30:00', '00:45:00', 15),
    (7, 12, '02:30:00', '02:45:00', 15);
-- Trip 9 (TP HCM - Vũng Tàu)
INSERT INTO TimePoints (
        tripId,
        pointId,
        arrivalTime,
        departureTime,
        stopDuration
    )
VALUES (9, 13, '07:30:00', '07:45:00', 15);
GO -- ================= THÊM TRANSACTIONS =================
INSERT INTO Transactions (
        walletId,
        amount,
        type,
        status,
        description,
        createdAt
    )
VALUES -- Top up
    (
        9,
        500000,
        'TOPUP',
        'SUCCESS',
        N'Nạp tiền qua banking',
        DATEADD(day, -30, GETDATE())
    ),
    (
        10,
        1000000,
        'TOPUP',
        'SUCCESS',
        N'Nạp tiền qua banking',
        DATEADD(day, -25, GETDATE())
    ),
    (
        11,
        200000,
        'TOPUP',
        'SUCCESS',
        N'Nạp tiền qua momo',
        DATEADD(day, -20, GETDATE())
    ),
    (
        12,
        1500000,
        'TOPUP',
        'SUCCESS',
        N'Nạp tiền qua banking',
        DATEADD(day, -15, GETDATE())
    ),
    -- Payments
    (
        9,
        350000,
        'PAYMENT',
        'SUCCESS',
        N'Thanh toán vé HN - ĐN',
        DATEADD(day, -28, GETDATE())
    ),
    (
        9,
        120000,
        'PAYMENT',
        'SUCCESS',
        N'Thanh toán vé HN - HP',
        DATEADD(day, -21, GETDATE())
    ),
    (
        10,
        280000,
        'PAYMENT',
        'SUCCESS',
        N'Thanh toán vé HCM - ĐL',
        DATEADD(day, -18, GETDATE())
    ),
    (
        10,
        150000,
        'PAYMENT',
        'SUCCESS',
        N'Thanh toán vé HCM - VT',
        DATEADD(day, -12, GETDATE())
    ),
    (
        11,
        250000,
        'PAYMENT',
        'SUCCESS',
        N'Thanh toán vé HN - SP',
        DATEADD(day, -8, GETDATE())
    );
GO -- ================= THÊM TICKETS =================
INSERT INTO Tickets (
        userId,
        tripId,
        seatId,
        totalAmount,
        paymentMethod,
        transactionId,
        status,
        bookedAt
    )
VALUES -- Khách hàng cũ (userId 3)
    (
        3,
        2,
        2,
        380000,
        'WALLET',
        2,
        'PAID',
        DATEADD(day, -25, GETDATE())
    ),
    -- Khách hàng mới
    (
        9,
        1,
        5,
        350000,
        'WALLET',
        6,
        'PAID',
        DATEADD(day, -28, GETDATE())
    ),
    (
        9,
        3,
        15,
        120000,
        'WALLET',
        7,
        'USED',
        DATEADD(day, -21, GETDATE())
    ),
    (
        10,
        7,
        25,
        280000,
        'WALLET',
        8,
        'PAID',
        DATEADD(day, -18, GETDATE())
    ),
    (
        10,
        9,
        35,
        150000,
        'WALLET',
        9,
        'USED',
        DATEADD(day, -12, GETDATE())
    ),
    (
        11,
        5,
        45,
        250000,
        'WALLET',
        10,
        'BOOKED',
        DATEADD(day, -8, GETDATE())
    ),
    (
        12,
        2,
        55,
        380000,
        'WALLET',
        11,
        'PAID',
        DATEADD(day, -5, GETDATE())
    ),
    (
        12,
        2,
        56,
        380000,
        'WALLET',
        11,
        'PAID',
        DATEADD(day, -5, GETDATE())
    ),
    (
        13,
        11,
        65,
        100000,
        'CASH',
        NULL,
        'BOOKED',
        DATEADD(day, -7, GETDATE())
    ),
    (
        14,
        4,
        75,
        120000,
        'CASH',
        NULL,
        'USED',
        DATEADD(day, -14, GETDATE())
    ),
    (
        15,
        6,
        85,
        250000,
        'BANKING',
        NULL,
        'PAID',
        DATEADD(day, -2, GETDATE())
    );
GO -- ================= THÊM TICKET PASSENGERS =================
INSERT INTO TicketPassengers (ticketId, fullName, phoneNumber, email)
VALUES (
        2,
        N'Trần Văn A',
        '0900000003',
        'customer@busgo.vn'
    ),
    (
        3,
        N'Nguyễn Văn Bình',
        '0912345688',
        'binh.nguyen@gmail.com'
    ),
    (
        4,
        N'Nguyễn Văn Bình',
        '0912345688',
        'binh.nguyen@gmail.com'
    ),
    (
        5,
        N'Phạm Thị Cúc',
        '0912345689',
        'cuc.pham@gmail.com'
    ),
    (
        6,
        N'Phạm Thị Cúc',
        '0912345689',
        'cuc.pham@gmail.com'
    ),
    (
        7,
        N'Hoàng Văn Dũng',
        '0912345690',
        'dung.hoang@gmail.com'
    ),
    (8, N'Đỗ Thị Em', '0912345691', 'em.do@gmail.com'),
    (
        9,
        N'Đỗ Văn Phát',
        '0987654321',
        'phat.do@gmail.com'
    ),
    (
        10,
        N'Vũ Văn Phúc',
        '0912345692',
        'phuc.vu@gmail.com'
    ),
    (
        11,
        N'Ngô Thị Hồng',
        '0912345693',
        'hong.ngo@gmail.com'
    );
GO -- ================= TẠO STORED PROCEDURES =================
    -- 1. Lấy danh sách tuyến phổ biến
    CREATE
    OR ALTER PROCEDURE sp_GetPopularRoutes @TopCount INT = 10 AS BEGIN
SELECT TOP (@TopCount) t.id,
    sFrom.name AS fromStation,
    sTo.name AS toStation,
    t.price,
    t.estimatedDuration,
    v.name AS vehicleName,
    pc.name AS companyName,
    COUNT(tk.id) AS totalBookings,
    AVG(tk.totalAmount) AS avgPrice
FROM Trips t
    JOIN Stations sFrom ON t.fromStationId = sFrom.id
    JOIN Stations sTo ON t.toStationId = sTo.id
    JOIN Vehicles v ON t.vehicleId = v.id
    JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
    LEFT JOIN Tickets tk ON t.id = tk.tripId
WHERE t.isActive = 1
GROUP BY t.id,
    sFrom.name,
    sTo.name,
    t.price,
    t.estimatedDuration,
    v.name,
    pc.name
ORDER BY totalBookings DESC,
    t.createdAt DESC
END
GO -- 2. Tìm kiếm tuyến xe
    CREATE
    OR ALTER PROCEDURE sp_SearchRoutes @FromStation NVARCHAR(150) = NULL,
    @ToStation NVARCHAR(150) = NULL,
    @DepartureDate DATE = NULL,
    @MinPrice DECIMAL(10, 2) = NULL,
    @MaxPrice DECIMAL(10, 2) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10 AS BEGIN
DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
SELECT t.id,
    sFrom.name AS fromStation,
    sFrom.address AS fromAddress,
    sFrom.province AS fromProvince,
    sTo.name AS toStation,
    sTo.address AS toAddress,
    sTo.province AS toProvince,
    t.startTime,
    t.price,
    t.estimatedDuration,
    v.name AS vehicleName,
    v.type AS vehicleType,
    v.numberOfFloors,
    pc.name AS companyName,
    pc.phone AS companyPhone,
    pc.logo AS companyLogo,
    (
        SELECT COUNT(*)
        FROM Seats
        WHERE vehicleId = v.id
            AND status = 'AVAILABLE'
    ) AS availableSeats,
    (
        SELECT TOP 1 imageUrl
        FROM ImageVehicles
        WHERE vehicleId = v.id
            AND isPrimary = 1
    ) AS primaryImage
FROM Trips t
    JOIN Stations sFrom ON t.fromStationId = sFrom.id
    JOIN Stations sTo ON t.toStationId = sTo.id
    JOIN Vehicles v ON t.vehicleId = v.id
    JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
WHERE t.isActive = 1
    AND (
        @FromStation IS NULL
        OR sFrom.name LIKE '%' + @FromStation + '%'
        OR sFrom.province LIKE '%' + @FromStation + '%'
    )
    AND (
        @ToStation IS NULL
        OR sTo.name LIKE '%' + @ToStation + '%'
        OR sTo.province LIKE '%' + @ToStation + '%'
    )
    AND (
        @DepartureDate IS NULL
        OR CAST(t.startTime AS DATE) = @DepartureDate
    )
    AND (
        @MinPrice IS NULL
        OR t.price >= @MinPrice
    )
    AND (
        @MaxPrice IS NULL
        OR t.price <= @MaxPrice
    )
ORDER BY t.startTime OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
END
GO -- 3. Lấy chi tiết chuyến xe
    CREATE
    OR ALTER PROCEDURE sp_GetTripDetails @TripId INT AS BEGIN -- Thông tin chuyến xe
SELECT t.id,
    sFrom.name AS fromStation,
    sFrom.address AS fromAddress,
    sTo.name AS toStation,
    sTo.address AS toAddress,
    t.startTime,
    t.price,
    t.estimatedDuration,
    t.imageUrl,
    v.name AS vehicleName,
    v.type AS vehicleType,
    v.description AS vehicleDescription,
    v.numberOfFloors,
    pc.name AS companyName,
    pc.phone AS companyPhone,
    pc.email AS companyEmail,
    pc.address AS companyAddress,
    pc.logo AS companyLogo
FROM Trips t
    JOIN Stations sFrom ON t.fromStationId = sFrom.id
    JOIN Stations sTo ON t.toStationId = sTo.id
    JOIN Vehicles v ON t.vehicleId = v.id
    JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
WHERE t.id = @TripId
    AND t.isActive = 1;
-- Danh sách ghế
SELECT s.id,
    s.name AS seatName,
    s.floor,
    s.type AS seatType,
    s.status,
    CASE
        WHEN tk.id IS NOT NULL THEN N'Đã đặt'
        ELSE N'Còn trống'
    END AS seatStatusText
FROM Seats s
    LEFT JOIN Tickets tk ON s.id = tk.seatId
    AND tk.tripId = @TripId
    AND tk.status IN ('BOOKED', 'PAID')
WHERE s.vehicleId = (
        SELECT vehicleId
        FROM Trips
        WHERE id = @TripId
    )
ORDER BY s.floor,
    s.name;
-- Các điểm dừng
SELECT tp.id,
    p.address AS stopPoint,
    tp.arrivalTime,
    tp.departureTime,
    tp.stopDuration
FROM TimePoints tp
    JOIN Points p ON tp.pointId = p.id
WHERE tp.tripId = @TripId
ORDER BY tp.arrivalTime;
END
GO -- 4. Đặt vé
    CREATE
    OR ALTER PROCEDURE sp_BookTicket @UserId INT,
    @TripId INT,
    @SeatId INT,
    @PassengerName NVARCHAR(100),
    @PassengerPhone VARCHAR(15),
    @PassengerEmail VARCHAR(100),
    @PaymentMethod VARCHAR(20),
    @Note NVARCHAR(MAX) = NULL AS BEGIN BEGIN TRANSACTION;
BEGIN TRY -- Kiểm tra ghế còn trống không
IF EXISTS (
    SELECT 1
    FROM Tickets
    WHERE tripId = @TripId
        AND seatId = @SeatId
        AND status IN ('BOOKED', 'PAID')
) BEGIN RAISERROR(N'Ghế đã được đặt', 16, 1);
RETURN;
END -- Lấy giá vé
DECLARE @Price DECIMAL(10, 2);
DECLARE @VehicleId INT;
SELECT @Price = price,
    @VehicleId = vehicleId
FROM Trips
WHERE id = @TripId;
-- Kiểm tra số dư ví nếu thanh toán bằng ví
IF @PaymentMethod = 'WALLET' BEGIN
DECLARE @Balance DECIMAL(12, 2);
SELECT @Balance = balance
FROM Wallets
WHERE userId = @UserId;
IF @Balance < @Price BEGIN RAISERROR(N'Số dư ví không đủ', 16, 1);
RETURN;
END
END -- Tạo giao dịch
DECLARE @TransactionId INT = NULL;
DECLARE @WalletId INT;
IF @PaymentMethod IN ('WALLET', 'BANKING') BEGIN
SELECT @WalletId = id
FROM Wallets
WHERE userId = @UserId;
INSERT INTO Transactions (walletId, amount, type, status, description)
VALUES (
        @WalletId,
        @Price,
        'PAYMENT',
        'PENDING',
        N'Thanh toán vé chuyến xe #' + CAST(@TripId AS NVARCHAR)
    );
SET @TransactionId = SCOPE_IDENTITY();
END -- Tạo vé
INSERT INTO Tickets (
        userId,
        tripId,
        seatId,
        totalAmount,
        paymentMethod,
        transactionId,
        status,
        note
    )
VALUES (
        @UserId,
        @TripId,
        @SeatId,
        @Price,
        @PaymentMethod,
        @TransactionId,
        CASE
            WHEN @PaymentMethod = 'CASH' THEN 'BOOKED'
            ELSE 'PAID'
        END,
        @Note
    );
DECLARE @TicketId INT = SCOPE_IDENTITY();
-- Thêm thông tin hành khách
INSERT INTO TicketPassengers (ticketId, fullName, phoneNumber, email)
VALUES (
        @TicketId,
        @PassengerName,
        @PassengerPhone,
        @PassengerEmail
    );
-- Cập nhật trạng thái ghế
UPDATE Seats
SET status = 'BOOKED'
WHERE id = @SeatId;
-- Nếu thanh toán bằng ví, cập nhật số dư và trạng thái giao dịch
IF @PaymentMethod = 'WALLET' BEGIN
UPDATE Wallets
SET balance = balance - @Price,
    updatedAt = GETDATE()
WHERE userId = @UserId;
UPDATE Transactions
SET status = 'SUCCESS'
WHERE id = @TransactionId;
END COMMIT TRANSACTION;
SELECT @TicketId AS ticketId;
END TRY BEGIN CATCH ROLLBACK TRANSACTION;
THROW;
END CATCH
END
GO -- ================= TẠO VIEWS =================
    -- View doanh thu theo nhà xe
    CREATE
    OR ALTER VIEW vw_CompanyRevenue AS
SELECT pc.id AS companyId,
    pc.name AS companyName,
    COUNT(DISTINCT t.id) AS totalTrips,
    COUNT(tk.id) AS totalTickets,
    SUM(tk.totalAmount) AS totalRevenue,
    AVG(tk.totalAmount) AS avgTicketPrice
FROM PassengerCarCompanies pc
    JOIN Vehicles v ON pc.id = v.partnerId
    JOIN Trips t ON v.id = t.vehicleId
    LEFT JOIN Tickets tk ON t.id = tk.tripId
GROUP BY pc.id,
    pc.name;
GO -- ================= KIỂM TRA DỮ LIỆU =================
SELECT 'USERS' AS TableName,
    COUNT(*) AS Total
FROM Users
UNION ALL
SELECT 'COMPANIES',
    COUNT(*)
FROM PassengerCarCompanies
UNION ALL
SELECT 'VEHICLES',
    COUNT(*)
FROM Vehicles
UNION ALL
SELECT 'STATIONS',
    COUNT(*)
FROM Stations
UNION ALL
SELECT 'TRIPS',
    COUNT(*)
FROM Trips
UNION ALL
SELECT 'SEATS',
    COUNT(*)
FROM Seats
UNION ALL
SELECT 'TICKETS',
    COUNT(*)
FROM Tickets
UNION ALL
SELECT 'TRANSACTIONS',
    COUNT(*)
FROM Transactions
ORDER BY TableName;
-- ================= TEST STORED PROCEDURES =================
PRINT '=== DANH SÁCH TUYẾN PHỔ BIẾN ===';
EXEC sp_GetPopularRoutes @TopCount = 5;
PRINT '=== TÌM KIẾM TUYẾN HÀ NỘI - ĐÀ NẴNG ===';
EXEC sp_SearchRoutes @FromStation = N 'Hà Nội',
@ToStation = N 'Đà Nẵng';
PRINT '=== CHI TIẾT CHUYẾN XE ID = 1 ===';
EXEC sp_GetTripDetails @TripId = 1;
GO
select *
from Users;
select *
from Vehicles;
SELECT *
FROM Trips;
SELECT *
FROM TimePoints;
SELECT *
FROM Seats;
SELECT *
FROM ImageVehicles;
select *
from Tickets;

CREATE OR ALTER TRIGGER trg_CreateSeatsForVehicle
ON Vehicles
AFTER INSERT
AS
BEGIN
    PRINT 'Trigger running'
    SET NOCOUNT ON;

    -- FLOOR 1 (14 ghế đầu)
    INSERT INTO Seats (vehicleId, name, floor, type, status)
    SELECT
        i.id,
        seat.name,
        1,
        seat.type,
        'AVAILABLE'
    FROM inserted i
    CROSS JOIN (
        VALUES
        ('A1','VIP'), ('A2','VIP'), ('A3','VIP'), ('A4','VIP'),
        ('B1','NORMAL'), ('B2','NORMAL'), ('B3','NORMAL'), ('B4','NORMAL'),
        ('C1','NORMAL'), ('C2','NORMAL'), ('C3','NORMAL'), ('C4','NORMAL'),
        ('D1','NORMAL'), ('D2','NORMAL')
    ) seat(name,type);

    -- FLOOR 2 (14 ghế còn lại)
    INSERT INTO Seats (vehicleId, name, floor, type, status)
    SELECT
        i.id,
        seat.name,
        2,
        seat.type,
        'AVAILABLE'
    FROM inserted i
    CROSS JOIN (
        VALUES
        ('D3','NORMAL'), ('D4','NORMAL'),
        ('E1','NORMAL'), ('E2','NORMAL'), ('E3','NORMAL'), ('E4','NORMAL'),
        ('F1','NORMAL'), ('F2','NORMAL'), ('F3','NORMAL'), ('F4','NORMAL'),
        ('G1','NORMAL'), ('G2','NORMAL'), ('G3','NORMAL'), ('G4','NORMAL')
    ) seat(name,type)
    WHERE i.numberOfFloors = 2;

END


CREATE OR ALTER PROCEDURE sp_GetPartnerTickets
    @PartnerId INT
AS
BEGIN
    SELECT 
        tk.id AS ticketId,
        tk.status,
        tk.totalAmount,
        tk.paymentMethod,
        tk.bookedAt,

        u.name AS customerName,
        u.phoneNumber AS customerPhone,

        t.id AS tripId,
        t.startTime,

        sFrom.name AS fromStation,
        sTo.name AS toStation,

        v.name AS vehicleName,

        tp.fullName AS passengerName,
        tp.phoneNumber AS passengerPhone

    FROM Tickets tk
    JOIN Users u ON tk.userId = u.id
    JOIN Trips t ON tk.tripId = t.id
    JOIN Vehicles v ON t.vehicleId = v.id
    JOIN Stations sFrom ON t.fromStationId = sFrom.id
    JOIN Stations sTo ON t.toStationId = sTo.id
    LEFT JOIN TicketPassengers tp ON tp.ticketId = tk.id

    WHERE v.partnerId = @PartnerId
    ORDER BY tk.bookedAt DESC;
END


INSERT INTO Vehicles
(name, licensePlate, type, numberOfFloors, partnerId)
VALUES
(N'Test Bus2','99A-99997','VIP',2,2)


SELECT TOP 1 * 
FROM Vehicles
ORDER BY id DESC

SELECT *
FROM Seats
WHERE vehicleId = 20


SELECT
t.name,
OBJECT_NAME(t.parent_id) AS table_name
FROM sys.triggers t

SELECT * FROM Trips WHERE id = 47;

INSERT INTO TimePoints (
    tripId,
    pointId,
    arrivalTime,
    departureTime,
    stopDuration
)
VALUES 
-- Đi qua các điểm miền Trung
(47, 2, '09:30:00', '09:45:00', 15),   -- Thanh Hóa
(47, 3, '12:00:00', '12:15:00', 15),   -- Vinh
(47, 4, '14:30:00', '14:45:00', 15),   -- Hà Tĩnh
(47, 5, '17:00:00', '17:15:00', 15),   -- Đồng Hới
(47, 6, '19:30:00', '19:45:00', 15),   -- Đông Hà
(47, 7, '21:30:00', '21:45:00', 15);   -- Huế

SELECT tp.*, p.address
FROM TimePoints tp
JOIN Points p ON tp.pointId = p.id
WHERE tp.tripId = 47
ORDER BY tp.arrivalTime;

DECLARE @TripId INT;
DECLARE @Now DATETIME = GETDATE();

INSERT INTO Trips (
    fromStationId,
    toStationId,
    vehicleId,
    startTime,
    price,
    estimatedDuration,
    imageUrl,
    isActive
)
VALUES (
    1,  -- Hà Nội
    3,  -- Đà Nẵng
    1,
    DATEADD(HOUR, -2, @Now), -- khởi hành cách đây 2 tiếng
    350000,
    900,
    '/images/trips/live-tracking.jpg',
    1
);

SET @TripId = SCOPE_IDENTITY();

DECLARE 
    @pThanhHoa INT,
    @pVinh INT,
    @pHaTinh INT,
    @pDongHoi INT,
    @pDongHa INT,
    @pHue INT;

SELECT @pThanhHoa = id FROM Points WHERE address = N'Thanh Hóa';
SELECT @pVinh = id FROM Points WHERE address = N'Vinh';
SELECT @pHaTinh = id FROM Points WHERE address = N'Hà Tĩnh';
SELECT @pDongHoi = id FROM Points WHERE address = N'Đồng Hới';
SELECT @pDongHa = id FROM Points WHERE address = N'Đông Hà';
SELECT @pHue = id FROM Points WHERE address = N'Huế';


INSERT INTO TimePoints (
    tripId,
    pointId,
    arrivalTime,
    departureTime,
    stopDuration
)
VALUES
-- ĐÃ ĐI QUA
(@TripId, @pThanhHoa, CAST(DATEADD(HOUR, -1, @Now) AS TIME), CAST(DATEADD(MINUTE, -45, @Now) AS TIME), 15),

-- ĐANG GẦN / SẮP TỚI
(@TripId, @pVinh, CAST(DATEADD(MINUTE, 30, @Now) AS TIME), CAST(DATEADD(MINUTE, 45, @Now) AS TIME), 15),

-- CHƯA ĐẾN
(@TripId, @pHaTinh, CAST(DATEADD(HOUR, 2, @Now) AS TIME), CAST(DATEADD(HOUR, 2, @Now) AS TIME), 15),
(@TripId, @pDongHoi, CAST(DATEADD(HOUR, 4, @Now) AS TIME), CAST(DATEADD(HOUR, 4, @Now) AS TIME), 15),
(@TripId, @pDongHa, CAST(DATEADD(HOUR, 6, @Now) AS TIME), CAST(DATEADD(HOUR, 6, @Now) AS TIME), 15),
(@TripId, @pHue, CAST(DATEADD(HOUR, 8, @Now) AS TIME), CAST(DATEADD(HOUR, 8, @Now) AS TIME), 15);


SELECT 
    p.address,
    tp.arrivalTime,
    tp.departureTime,
    CASE 
        WHEN CAST(GETDATE() AS TIME) < tp.arrivalTime THEN 'UPCOMING'
        WHEN CAST(GETDATE() AS TIME) BETWEEN tp.arrivalTime AND tp.departureTime THEN 'STOPPING'
        ELSE 'PASSED'
    END AS status
FROM TimePoints tp
JOIN Points p ON tp.pointId = p.id
WHERE tp.tripId = @TripId
ORDER BY tp.arrivalTime;

INSERT INTO Transactions (walletId, amount, type, status, description)
VALUES (
    (SELECT id FROM Wallets WHERE userId = 2),
    350000,
    'PAYMENT',
    'SUCCESS',
    N'Test tracking trip 50'
);

INSERT INTO Tickets (
    userId,
    tripId,
    seatId,
    totalAmount,
    paymentMethod,
    transactionId,
    status
)
VALUES (
    2,          -- userId (partner)
    50,         -- tripId
    1,          -- seatId (thay bằng seat bạn lấy được)
    350000,
    'WALLET',
    (SELECT TOP 1 id FROM Transactions ORDER BY id DESC),
    'PAID'
);

INSERT INTO TicketPassengers (
    ticketId,
    fullName,
    phoneNumber,
    email
)
VALUES (
    (SELECT TOP 1 id FROM Tickets ORDER BY id DESC),
    N'Test User 2',
    '0900000999',
    'test2@busgo.vn'
);


