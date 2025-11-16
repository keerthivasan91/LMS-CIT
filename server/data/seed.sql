USE lms_cit;

-- CLEAR TABLES (optional if used in dev)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE departments;
TRUNCATE TABLE users;
TRUNCATE TABLE leave_balance;
TRUNCATE TABLE holidays;
TRUNCATE TABLE leave_requests;
TRUNCATE TABLE arrangements;
TRUNCATE TABLE notifications;
TRUNCATE TABLE activity_log;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE settings;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- DEPARTMENTS
-- =====================================================================

INSERT INTO departments (department_code, department_name) VALUES
('CSE', 'Computer Science and Engineering'),
('ECE', 'Electronics and Communication Engineering'), 
('MECH', 'Mechanical Engineering'),
('ADMIN', 'Administration'),
('MGMT', 'Management');

-- =====================================================================
-- USERS
-- =====================================================================

INSERT INTO users (user_id, name, email, password, role, department_code, phone, designation, date_joined) VALUES
('PRINC001', 'Dr. Kavitha Rao', 'principal@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'principal', 'MGMT', '9876543210', 'Principal', '2015-06-10'),

('HODCSE01', 'Prof. Suresh M', 'keerthivasan161@gmail.com', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'hod', 'CSE', '9876501234', 'HOD - CSE', '2017-02-15'),

('FAC001', 'Keerthi V', 'superbob991@gmail.com', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CSE', '9876505678', 'Assistant Professor', '2021-01-10'),
('FAC002', 'Arun Kumar', 'keerthivasan1617@gmail.com', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CSE', '9876509876', 'Assistant Professor', '2022-08-05'),
('FAC003', 'Deepa R', 'deepa.cse@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CSE', '9876512345', 'Assistant Professor', '2020-12-22'),

('ADMIN01', 'Ravi Shankar', 'admin@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'admin', 'ADMIN', '9123456780', 'System Admin', '2018-03-18'),

('STAFF01', 'Lakshmi', 'lakshmi.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'CSE', '9000001111', 'Office Staff', '2019-10-12');

-- Update departments with HOD information
UPDATE departments SET hod_id = 'HODCSE01' WHERE department_code = 'CSE';

-- =====================================================================
-- LEAVE BALANCE (with academic year)
-- =====================================================================

INSERT INTO leave_balance (user_id, academic_year, casual_total, casual_used, sick_total, sick_used, earned_total, earned_used, comp_total, comp_used) VALUES
('PRINC001', 2025, 12, 2, 12, 1, 30, 10, 5, 0),
('HODCSE01', 2025, 12, 4, 12, 2, 30, 8, 2, 1),
('FAC001', 2025, 12, 3, 12, 0, 15, 5, 1, 0),
('FAC002', 2025, 12, 0, 12, 0, 15, 2, 0, 0),
('FAC003', 2025, 12, 1, 12, 1, 15, 3, 0, 0),
('ADMIN01', 2025, 12, 2, 12, 1, 20, 6, 3, 1),
('STAFF01', 2025, 12, 1, 12, 0, 20, 3, 2, 0);

-- =====================================================================
-- HOLIDAYS (with academic year)
-- =====================================================================

INSERT INTO holidays (date, name, description, academic_year) VALUES
('2025-01-01', 'New Year', 'New Year Celebration', 2025),
('2025-01-15', 'Pongal', 'State Festival', 2025),
('2025-03-29', 'Good Friday', 'National Holiday', 2025),
('2025-08-15', 'Independence Day', 'National Holiday', 2025),
('2025-10-02', 'Gandhi Jayanti', 'National Holiday', 2025),
('2025-12-25', 'Christmas', 'Festival Holiday', 2025);


-- =====================================================================
-- PASSWORD RESET TOKENS
-- =====================================================================

INSERT INTO password_reset_tokens (token, user_id, expires_at, used) VALUES
('RESET-123456789', 'FAC001', DATE_ADD(NOW(), INTERVAL 1 HOUR), 0),
('RESET-987654321', 'FAC002', DATE_ADD(NOW(), INTERVAL 1 HOUR), 0);


-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Verify data insertion
SELECT 'Departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Leave Balance', COUNT(*) FROM leave_balance
UNION ALL
SELECT 'Holidays', COUNT(*) FROM holidays
UNION ALL
SELECT 'Leave Requests', COUNT(*) FROM leave_requests
UNION ALL
SELECT 'Arrangements', COUNT(*) FROM arrangements
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Activity Log', COUNT(*) FROM activity_log;

-- View sample leave requests with status
SELECT 
    lr.leave_id,
    u.name as faculty_name,
    lr.leave_type,
    lr.start_date,
    lr.end_date,
    lr.days,
    lr.substitute_status,
    lr.hod_status,
    lr.principal_status,
    lr.final_status
FROM leave_requests lr
JOIN users u ON lr.user_id = u.user_id
ORDER BY lr.leave_id;