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
  leave_type ENUM('casual', 'sick', 'earned', 'compensation', 'other') NOT NULL,
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

  substitute_id VARCHAR(50) NULL,
  substitute_status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  hod_status ENUM('pending','approved','rejected') DEFAULT 'pending',
  principal_status ENUM('pending','approved','rejected') DEFAULT 'pending',
  final_status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
  
  hod_remarks TEXT,
  principal_remarks TEXT,
  substitute_remarks TEXT,

  applied_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_on DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (substitute_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (department_code) REFERENCES departments(department_code) ON DELETE CASCADE,

  INDEX idx_user_applied_on (user_id, applied_on),
  INDEX idx_substitute (substitute_id),
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
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  remarks TEXT,
  responded_on DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (leave_id) REFERENCES leave_requests(leave_id) ON DELETE CASCADE,
  FOREIGN KEY (substitute_id) REFERENCES users(user_id) ON DELETE CASCADE,

  UNIQUE KEY uq_leave_substitute (leave_id, substitute_id),
  INDEX idx_substitute_status (substitute_id, status),
  INDEX idx_leave_id (leave_id)
) ENGINE=InnoDB;

CREATE TABLE activity_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id VARCHAR(50) NULL,
  target_leave_id INT NULL,
  action VARCHAR(255) NOT NULL,
  metadata JSON NULL,
  ip VARCHAR(45),
  user_agent VARCHAR(255),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (actor_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (target_leave_id) REFERENCES leave_requests(leave_id) ON DELETE SET NULL,

  INDEX idx_actor_time (actor_id, timestamp),
  INDEX idx_action_time (action, timestamp),
  INDEX idx_leave_id (target_leave_id)
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
  sick_total INT DEFAULT 0,
  sick_used INT DEFAULT 0,
  earned_total INT DEFAULT 0,
  earned_used INT DEFAULT 0,
  comp_total INT DEFAULT 0,
  comp_used INT DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_academic_year (user_id, academic_year),
  INDEX idx_user_id (user_id),
  INDEX idx_academic_year (academic_year)
) ENGINE=InnoDB;

CREATE TABLE sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(50) NULL,
  data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

  INDEX idx_session_expiry (expires_at),
  INDEX idx_session_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
  token_id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(128) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

  INDEX idx_reset_user (user_id),
  INDEX idx_reset_expires (expires_at),
  INDEX idx_token (token),
  INDEX idx_used (used)
) ENGINE=InnoDB;


-- Improved view with academic year support
CREATE VIEW vw_user_leave_summary AS
SELECT 
  u.user_id, 
  u.name,
  u.department_code,
  d.department_name,
  lb.academic_year,
  lb.casual_total, 
  lb.casual_used,
  (lb.casual_total - lb.casual_used) as casual_remaining,
  lb.sick_total, 
  lb.sick_used,
  (lb.sick_total - lb.sick_used) as sick_remaining,
  lb.earned_total, 
  lb.earned_used,
  (lb.earned_total - lb.earned_used) as earned_remaining,
  lb.comp_total, 
  lb.comp_used,
  (lb.comp_total - lb.comp_used) as comp_remaining
FROM users u
LEFT JOIN leave_balance lb ON lb.user_id = u.user_id AND lb.academic_year = YEAR(CURDATE())
LEFT JOIN departments d ON u.department_code = d.department_code
WHERE u.is_active = 1;

-- View for leave requests with user details
CREATE VIEW vw_leave_requests AS
SELECT 
  lr.*,
  u.name as user_name,
  u.designation as user_designation,
  u.department_code as user_department,
  s.name as substitute_name,
  d.department_name
FROM leave_requests lr
JOIN users u ON lr.user_id = u.user_id
LEFT JOIN users s ON lr.substitute_id = s.user_id
LEFT JOIN departments d ON lr.department_code = d.department_code;