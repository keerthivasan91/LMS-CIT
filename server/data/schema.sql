DROP DATABASE IF EXISTS lms_cit;
CREATE DATABASE lms_cit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lms_cit;

-- Create departments table first since it's referenced
CREATE TABLE departments (
  department_code VARCHAR(20) PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL,
  hod_id VARCHAR(50) NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'hod', 'principal', 'admin', 'staff') NOT NULL,
  department_code VARCHAR(20) NULL,
  phone VARCHAR(20),
  designation VARCHAR(100),
  date_joined DATE,
  is_active TINYINT(1) DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (department_code) REFERENCES departments(department_code) ON DELETE SET NULL,
  INDEX idx_role_department (role, department_code),
  INDEX idx_email (email),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- Now update departments with HOD reference
ALTER TABLE departments ADD FOREIGN KEY (hod_id) REFERENCES users(user_id) ON DELETE SET NULL;

CREATE TABLE holidays (
  holiday_id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  academic_year YEAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_date (date),
  INDEX idx_academic_year (academic_year)
) ENGINE=InnoDB;

CREATE TABLE leave_requests (
  leave_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  department_code VARCHAR(20) NOT NULL,
  leave_type ENUM('Casual Leave', 'OOD', 'Earned Leave', 'Permitted Leave', 'Special Casual Leave','Loss of Pay Leave','Compensatory Off Leave') NOT NULL,
  start_date DATE NOT NULL,
  start_session ENUM('Forenoon','Afternoon') NOT NULL,
  end_date DATE NOT NULL,
  end_session ENUM('Forenoon','Afternoon') NOT NULL,
  reason TEXT NOT NULL,
  
  -- Fixed duration calculation
  days DECIMAL(6,2) GENERATED ALWAYS AS (
    CASE 
      WHEN start_date = end_date THEN
        CASE 
          WHEN start_session = 'Forenoon' AND end_session = 'Afternoon' THEN 1.0
          WHEN start_session = 'Forenoon' AND end_session = 'Forenoon' THEN 0.5
          WHEN start_session = 'Afternoon' AND end_session = 'Afternoon' THEN 0.5
          ELSE 0.0
        END
      ELSE
        (DATEDIFF(end_date, start_date) + 1) -
        (CASE WHEN start_session = 'Afternoon' THEN 0.5 ELSE 0 END) -
        (CASE WHEN end_session = 'Forenoon' THEN 0.5 ELSE 0 END)
    END
  ) STORED,
  final_substitute_status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  hod_status ENUM('pending','approved','rejected') DEFAULT null,
  principal_status ENUM('pending','approved','rejected') DEFAULT null,
  final_status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
  
  applied_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_on DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (department_code) REFERENCES departments(department_code) ON DELETE CASCADE,

  INDEX idx_user_applied_on (user_id, applied_on),
  INDEX idx_status_applied_on (final_status, applied_on),
  INDEX idx_leave_type (leave_type),
  INDEX idx_final_status (final_status),
  INDEX idx_department_status (department_code, final_status),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB;

CREATE TABLE arrangements (
    arrangement_id INT AUTO_INCREMENT PRIMARY KEY,
    
    leave_id INT NOT NULL,
    substitute_id VARCHAR(50) NOT NULL,
    
    department_code VARCHAR(20) DEFAULT NULL,
    details TEXT DEFAULT NULL,
    
    status ENUM('pending','accepted','rejected') 
        DEFAULT 'pending',
        
    responded_on DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_arrangements_leave
        FOREIGN KEY (leave_id) 
        REFERENCES leave_requests(leave_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_arrangements_sub
        FOREIGN KEY (substitute_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    
    -- Prevent duplicate substitutes for a leave
    UNIQUE KEY uq_leave_substitute (leave_id, substitute_id),
    
    -- Allow fast filtering for "my substitute requests"
    INDEX idx_substitute_status (substitute_id, status),
    
    -- Allow fast lookups for leave details
    INDEX idx_leave_id (leave_id)
) ENGINE=InnoDB;



CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  receiver_id VARCHAR(50) NOT NULL,
  sender_id VARCHAR(50) NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  status ENUM('unread', 'read') DEFAULT 'unread',
  related_leave_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (related_leave_id) REFERENCES leave_requests(leave_id) ON DELETE SET NULL,

  INDEX idx_receiver_status (receiver_id, status),
  INDEX idx_notifications_time (receiver_id, created_at),
  INDEX idx_type (type)
) ENGINE=InnoDB;

CREATE TABLE leave_balance (
  balance_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  academic_year YEAR NOT NULL,
  casual_total INT DEFAULT 0,
  casual_used INT DEFAULT 0,
  earned_total INT DEFAULT 0,
  earned_used INT DEFAULT 0,
  rh_total INT DEFAULT 0,
  rh_used INT DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_academic_year (user_id, academic_year),
  INDEX idx_user_id (user_id),
  INDEX idx_academic_year (academic_year)
) ENGINE=InnoDB;


CREATE TABLE password_reset_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    status ENUM('pending','resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    INDEX (user_id),
    INDEX (status)
);
DELIMITER $$

CREATE TRIGGER trg_add_leave_balance
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE casual INT DEFAULT 0;
    DECLARE earned INT DEFAULT 0;
    DECLARE rh INT DEFAULT 0;

    -- Assign leave totals based on role
    IF NEW.role = 'faculty' THEN
        SET casual = 12;
        SET rh = 3;
        SET earned = 6;

    ELSEIF NEW.role = 'hod' THEN
        SET casual = 12;
        SET rh  = 3;
        SET earned = 6;

    ELSEIF NEW.role = 'staff' THEN
        SET casual = 10;
        SET rh = 3;
        SET earned = 4;

    ELSEIF NEW.role IN ('admin', 'principal') THEN
        SET casual = 0;
        SET earned = 0;
        SET rh = 0;
    END IF;

    INSERT INTO leave_balance (
        user_id,
        academic_year,
        casual_total, casual_used,
        rh_total, rh_used,
        earned_total, earned_used
    ) VALUES (
        NEW.user_id,
        YEAR(CURDATE()),
        casual, 0,
        rh, 0,
        earned, 0
    );

END$$

DELIMITER ;





CREATE TABLE mail_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,

  -- status lifecycle
  status ENUM('pending','processing','sent','failed','permanent_failed') NOT NULL DEFAULT 'pending',

  -- retry / processing metadata
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  processing_token VARCHAR(36) DEFAULT NULL,
  processing_started_at DATETIME DEFAULT NULL,
  next_retry_at DATETIME DEFAULT NULL,

  last_error TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status_nextretry (status, next_retry_at),
  INDEX idx_processing_token (processing_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

