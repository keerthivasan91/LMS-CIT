-- LMS-CIT Database Schema
-- Leave Management System for CIT
DROP DATABASE IF EXISTS faculty_leave_1;
CREATE DATABASE faculty_leave_1;
USE faculty_leave_1;
-- Drop existing tables if they exist
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS 
    archive_leaves,
    sessions,
    leave_balance,
    notifications,
    activity_log,
    holidays,
    arrangements,
    leaves,
    users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('faculty', 'hod', 'principal', 'admin', 'staff') NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(15),
    designation VARCHAR(100),
    date_joined DATE,
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_department (department),
    INDEX idx_role (role),
    INDEX idx_email (email)
);

-- 2. Leaves Table
CREATE TABLE leaves (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type ENUM('Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Study', 'Other') NOT NULL,
    start_date DATE NOT NULL,
    start_session ENUM('FN', 'AN') NOT NULL,
    end_date DATE NOT NULL,
    end_session ENUM('FN', 'AN') NOT NULL,
    duration_days DECIMAL(5,2) NOT NULL,
    reason TEXT,
    substitute_id INT NULL,
    substitute_status ENUM('pending', 'accepted', 'rejected', 'not_applicable') DEFAULT 'pending',
    hod_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    principal_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    final_status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    arrangement_details TEXT,
    request_token VARCHAR(64) UNIQUE,
    applied_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    hod_responded_on DATETIME NULL,
    principal_responded_on DATETIME NULL,
    substitute_responded_on DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (substitute_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_applied_on (user_id, applied_on),
    INDEX idx_substitute (substitute_id),
    INDEX idx_department_status (hod_status, principal_status),
    INDEX idx_final_status (final_status),
    INDEX idx_dates (start_date, end_date)
);

-- 3. Arrangements Table (Substitute Requests)
CREATE TABLE arrangements (
    arrangement_id INT AUTO_INCREMENT PRIMARY KEY,
    leave_id INT NOT NULL,
    substitute_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    responded_on DATETIME NULL,
    arrangement_details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leave_id) REFERENCES leaves(leave_id) ON DELETE CASCADE,
    FOREIGN KEY (substitute_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_leave_substitute (leave_id, substitute_id),
    INDEX idx_substitute_status (substitute_id, status),
    INDEX idx_leave_status (leave_id, status)
);

-- 4. Holidays Table
CREATE TABLE holidays (
    holiday_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    academic_year YEAR,
    is_recurring TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_holiday_date (date, name),
    INDEX idx_date (date),
    INDEX idx_academic_year (academic_year)
);

-- 5. Activity Log Table
CREATE TABLE activity_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    actor_id INT NULL,
    target_leave_id INT NULL,
    action VARCHAR(255) NOT NULL,
    metadata JSON NULL,
    ip VARCHAR(45),
    user_agent VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (target_leave_id) REFERENCES leaves(leave_id) ON DELETE SET NULL,
    INDEX idx_actor_timestamp (actor_id, timestamp),
    INDEX idx_action_timestamp (action, timestamp),
    INDEX idx_leave_id (target_leave_id)
);

-- 6. Notifications Table
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    receiver_id INT NOT NULL,
    sender_id INT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'leave_request', 'substitute_request') DEFAULT 'info',
    related_leave_id INT NULL,
    status ENUM('unread', 'read') DEFAULT 'unread',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME NULL,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (related_leave_id) REFERENCES leaves(leave_id) ON DELETE SET NULL,
    INDEX idx_receiver_status (receiver_id, status),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type)
);

-- 7. Leave Balance Table
CREATE TABLE leave_balance (
    balance_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type ENUM('Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Study', 'Other') NOT NULL,
    academic_year YEAR NOT NULL,
    total_days INT DEFAULT 0,
    used_days INT DEFAULT 0,
    remaining_days INT GENERATED ALWAYS AS (total_days - used_days) STORED,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_leave_year (user_id, leave_type, academic_year),
    INDEX idx_user_year (user_id, academic_year),
    INDEX idx_leave_type (leave_type)
);

-- 8. Sessions Table
CREATE TABLE sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    user_id INT NULL,
    data JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- 9. Archive Leaves Table (for long-term storage)
CREATE TABLE archive_leaves (
    archive_id INT AUTO_INCREMENT PRIMARY KEY,
    original_leave_id INT NOT NULL,
    user_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_department VARCHAR(100) NOT NULL,
    leave_type ENUM('Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Study', 'Other') NOT NULL,
    start_date DATE NOT NULL,
    start_session ENUM('FN', 'AN') NOT NULL,
    end_date DATE NOT NULL,
    end_session ENUM('FN', 'AN') NOT NULL,
    duration_days DECIMAL(5,2) NOT NULL,
    reason TEXT,
    substitute_name VARCHAR(100) NULL,
    final_status ENUM('approved', 'rejected', 'cancelled') NOT NULL,
    academic_year YEAR NOT NULL,
    applied_on DATETIME NOT NULL,
    archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_year (user_id, academic_year),
    INDEX idx_department_year (user_department, academic_year),
    INDEX idx_archived_at (archived_at)
);

-- Insert Sample Data

-- Sample Users
INSERT INTO users (name, email, password, role, department, phone, designation, date_joined) VALUES
('Dr. Rajesh Kumar', 'rajesh.kumar@cit.edu', 'password123', 'faculty', 'Computer Science', '9876543210', 'Professor', '2020-01-15'),
('Dr. Priya Sharma', 'priya.sharma@cit.edu', 'password123', 'hod', 'Computer Science', '9876543211', 'HOD & Professor', '2018-06-01'),
('Dr. Arun Patel', 'arun.patel@cit.edu', 'password123', 'faculty', 'Computer Science', '9876543212', 'Associate Professor', '2019-03-10'),
('Dr. Meena Nair', 'meena.nair@cit.edu', 'password123', 'faculty', 'Computer Science', '9876543213', 'Assistant Professor', '2021-07-20'),
('Dr. Suresh Reddy', 'suresh.reddy@cit.edu', 'password123', 'principal', NULL, '9876543214', 'Principal', '2015-01-01'),
('Dr. Anjali Singh', 'anjali.singh@cit.edu', 'password123', 'admin', NULL, '9876543215', 'Administrator', '2017-02-15'),
('Dr. Vikram Joshi', 'vikram.joshi@cit.edu', 'password123', 'hod', 'Electronics', '9876543216', 'HOD & Professor', '2016-08-12'),
('Dr. Neha Gupta', 'neha.gupta@cit.edu', 'password123', 'faculty', 'Electronics', '9876543217', 'Professor', '2019-11-05');

-- Sample Holidays
INSERT INTO holidays (date, name, description, academic_year, is_recurring) VALUES
('2024-01-26', 'Republic Day', 'National Holiday', 2024, 1),
('2024-03-25', 'Holi', 'Festival of Colors', 2024, 0),
('2024-04-09', 'Ugadi', 'Telugu New Year', 2024, 0),
('2024-05-01', 'May Day', 'Labour Day', 2024, 1),
('2024-08-15', 'Independence Day', 'National Holiday', 2024, 1),
('2024-09-07', 'Ganesh Chaturthi', 'Vinayaka Chavithi', 2024, 0),
('2024-10-02', 'Gandhi Jayanti', 'National Holiday', 2024, 1),
('2024-12-25', 'Christmas', 'Christmas Day', 2024, 1);

-- Sample Leave Balance
INSERT INTO leave_balance (user_id, leave_type, academic_year, total_days, used_days) VALUES
(1, 'Casual', 2024, 15, 2),
(1, 'Sick', 2024, 12, 1),
(1, 'Earned', 2024, 30, 5),
(2, 'Casual', 2024, 15, 0),
(2, 'Sick', 2024, 12, 0),
(3, 'Casual', 2024, 15, 3),
(4, 'Casual', 2024, 15, 1),
(8, 'Casual', 2024, 15, 0);

-- Sample Leaves (for testing)
INSERT INTO leaves (user_id, leave_type, start_date, start_session, end_date, end_session, duration_days, reason, substitute_id, substitute_status, hod_status, principal_status, final_status) VALUES
(1, 'Casual', '2024-02-01', 'FN', '2024-02-02', 'AN', 2.0, 'Family function', 3, 'accepted', 'approved', 'approved', 'approved'),
(1, 'Sick', '2024-02-15', 'FN', '2024-02-16', 'AN', 2.0, 'Medical checkup', NULL, 'not_applicable', 'approved', 'approved', 'approved'),
(3, 'Casual', '2024-02-20', 'FN', '2024-02-21', 'AN', 2.0, 'Personal work', 4, 'pending', 'pending', 'pending', 'pending'),
(4, 'Earned', '2024-03-01', 'FN', '2024-03-05', 'AN', 5.0, 'Vacation', 1, 'accepted', 'approved', 'pending', 'pending');

-- Sample Arrangements
INSERT INTO arrangements (leave_id, substitute_id, status, arrangement_details) VALUES
(1, 3, 'accepted', 'Will cover Data Structures classes'),
(3, 4, 'pending', 'Please cover Database Management classes'),
(4, 1, 'accepted', 'Will handle Computer Networks lab sessions');

-- Sample Notifications
INSERT INTO notifications (receiver_id, sender_id, title, message, type, related_leave_id, status) VALUES
(3, 1, 'Substitute Request', 'Dr. Rajesh Kumar requested you to be substitute for their leave', 'substitute_request', 1, 'read'),
(2, 1, 'Leave Approval Required', 'New leave request from Dr. Rajesh Kumar needs your approval', 'leave_request', 1, 'read'),
(5, 2, 'Principal Approval Required', 'Leave request approved by HOD needs final approval', 'leave_request', 1, 'unread'),
(4, 3, 'Substitute Request', 'Dr. Arun Patel requested you to be substitute for their leave', 'substitute_request', 3, 'unread');

-- Sample Activity Log
INSERT INTO activity_log (actor_id, target_leave_id, action, metadata, ip, user_agent) VALUES
(1, 1, 'leave_applied', '{"leave_type": "Casual", "days": 2}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(3, 1, 'substitute_accepted', '{"substitute_id": 3}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(2, 1, 'hod_approved', '{"hod_id": 2}', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');

-- Create Views for Common Queries

-- View for Leave Summary
CREATE VIEW leave_summary AS
SELECT 
    l.leave_id,
    l.user_id,
    u.name as user_name,
    u.department,
    l.leave_type,
    l.start_date,
    l.end_date,
    l.duration_days,
    l.substitute_status,
    l.hod_status,
    l.principal_status,
    l.final_status,
    l.applied_on,
    s.name as substitute_name
FROM leaves l
JOIN users u ON l.user_id = u.user_id
LEFT JOIN users s ON l.substitute_id = s.user_id;

-- View for Department Leave Stats
CREATE VIEW department_leave_stats AS
SELECT 
    u.department,
    COUNT(l.leave_id) as total_leaves,
    SUM(CASE WHEN l.final_status = 'approved' THEN 1 ELSE 0 END) as approved_leaves,
    SUM(CASE WHEN l.final_status = 'rejected' THEN 1 ELSE 0 END) as rejected_leaves,
    SUM(CASE WHEN l.final_status = 'pending' THEN 1 ELSE 0 END) as pending_leaves,
    COALESCE(SUM(l.duration_days), 0) as total_days
FROM users u
LEFT JOIN leaves l ON u.user_id = l.user_id
WHERE u.role IN ('faculty', 'staff')
GROUP BY u.department;

-- Create Stored Procedures

DELIMITER //

-- Procedure to calculate duration days
CREATE PROCEDURE CalculateLeaveDuration(
    IN p_start_date DATE,
    IN p_start_session ENUM('FN','AN'),
    IN p_end_date DATE,
    IN p_end_session ENUM('FN','AN'),
    OUT p_duration DECIMAL(5,2)
)
BEGIN
    DECLARE total_days INT;
    DECLARE day_count INT DEFAULT 0;
    DECLARE current_date DATE;
    DECLARE session_multiplier DECIMAL(3,2);
    
    SET total_days = DATEDIFF(p_end_date, p_start_date) + 1;
    SET p_duration = 0;
    
    -- For single day leave
    IF total_days = 1 THEN
        IF p_start_session = 'FN' AND p_end_session = 'AN' THEN
            SET p_duration = 1.0;
        ELSEIF p_start_session = 'FN' AND p_end_session = 'FN' THEN
            SET p_duration = 0.5;
        ELSEIF p_start_session = 'AN' AND p_end_session = 'AN' THEN
            SET p_duration = 0.5;
        END IF;
    ELSE
        -- First day
        IF p_start_session = 'FN' THEN
            SET p_duration = p_duration + 1.0;
        ELSE
            SET p_duration = p_duration + 0.5;
        END IF;
        
        -- Last day
        IF p_end_session = 'AN' THEN
            SET p_duration = p_duration + 1.0;
        ELSE
            SET p_duration = p_duration + 0.5;
        END IF;
        
        -- Middle days (full days)
        IF total_days > 2 THEN
            SET p_duration = p_duration + (total_days - 2);
        END IF;
    END IF;
END//

DELIMITER ;

-- Create Triggers

DELIMITER //

-- Trigger to update leave balance when leave is approved
CREATE TRIGGER after_leave_approval
    AFTER UPDATE ON leaves
    FOR EACH ROW
BEGIN
    IF NEW.final_status = 'approved' AND OLD.final_status != 'approved' THEN
        UPDATE leave_balance 
        SET used_days = used_days + NEW.duration_days,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND leave_type = NEW.leave_type
        AND academic_year = YEAR(NEW.start_date);
    END IF;
END//

-- Trigger to log important leave activities
CREATE TRIGGER after_leave_status_change
    AFTER UPDATE ON leaves
    FOR EACH ROW
BEGIN
    IF NEW.hod_status != OLD.hod_status THEN
        INSERT INTO activity_log (actor_id, target_leave_id, action, metadata)
        VALUES (
            NULL, -- System generated
            NEW.leave_id,
            CONCAT('hod_', NEW.hod_status),
            JSON_OBJECT('previous_status', OLD.hod_status, 'new_status', NEW.hod_status)
        );
    END IF;
    
    IF NEW.principal_status != OLD.principal_status THEN
        INSERT INTO activity_log (actor_id, target_leave_id, action, metadata)
        VALUES (
            NULL, -- System generated
            NEW.leave_id,
            CONCAT('principal_', NEW.principal_status),
            JSON_OBJECT('previous_status', OLD.principal_status, 'new_status', NEW.principal_status)
        );
    END IF;
END//

DELIMITER ;

-- Create Functions

DELIMITER //

-- Function to check if user has sufficient leave balance
CREATE FUNCTION CheckLeaveBalance(
    p_user_id INT,
    p_leave_type ENUM('Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Study', 'Other'),
    p_days_needed DECIMAL(5,2),
    p_academic_year YEAR
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE available_days DECIMAL(5,2);
    
    SELECT remaining_days INTO available_days
    FROM leave_balance
    WHERE user_id = p_user_id 
    AND leave_type = p_leave_type
    AND academic_year = p_academic_year;
    
    IF available_days IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN available_days >= p_days_needed;
END//

DELIMITER ;

-- Display created tables
SHOW TABLES;

-- Display table structures
DESCRIBE users;
DESCRIBE leaves;
DESCRIBE arrangements;
DESCRIBE holidays;
DESCRIBE activity_log;
DESCRIBE notifications;
DESCRIBE leave_balance;
DESCRIBE sessions;
DESCRIBE archive_leaves;

-- Display sample data counts
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL SELECT 'leaves', COUNT(*) FROM leaves
UNION ALL SELECT 'arrangements', COUNT(*) FROM arrangements
UNION ALL SELECT 'holidays', COUNT(*) FROM holidays
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'leave_balance', COUNT(*) FROM leave_balance
UNION ALL SELECT 'activity_log', COUNT(*) FROM activity_log;