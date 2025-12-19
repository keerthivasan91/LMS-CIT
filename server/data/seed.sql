-- =====================================================================
-- CLEAR TABLES (maintains structure, resets data)
-- =====================================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE mail_queue;
TRUNCATE TABLE password_reset_requests;
TRUNCATE TABLE leave_balance;
TRUNCATE TABLE arrangements;
TRUNCATE TABLE notifications;
TRUNCATE TABLE leave_requests;
TRUNCATE TABLE holidays;
TRUNCATE TABLE users;
TRUNCATE TABLE departments;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- DEPARTMENTS (Expanded with multiple departments)
-- =====================================================================
INSERT INTO departments (department_code, department_name, is_active) VALUES
('CSE', 'Computer Science and Engineering', 1),
('ECE', 'Electronics and Communication Engineering', 1),
('MECH', 'Mechanical Engineering', 1),
('CIVIL', 'Civil Engineering', 1),
('ADMIN', 'Administration', 1),
('MGMT', 'Management', 1),
('PHYSICS', 'Physics', 1),
('CHEM', 'Chemistry', 1),
('MATH', 'Mathematics', 1),
('LIB', 'Library', 1);

-- =====================================================================
-- USERS (Faculty, HODs, Admin, Staff - with realistic distribution)
-- =====================================================================

-- Administration (Principals & Admin)
INSERT INTO users (user_id, name, email, password, role, department_code, phone, designation, date_joined) VALUES
('PRINC001', 'Dr. Kavitha Rao', 'principal@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'principal', 'MGMT', '9876543210', 'Principal', '2015-06-10'),
('ADMIN01', 'Ravi Shankar', 'admin@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'admin', 'MGMT', '9123456780', 'System Administrator', '2018-03-18'),
('ADMIN02', 'Priya Sharma', 'it.admin@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'admin', 'MGMT', '9123456781', 'IT Administrator', '2019-07-22'),

-- HODs (Department Heads)
('HODCSE01', 'Prof. Suresh M', 'hod.cse@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'hod', 'CSE', '9876501234', 'Head of Department - CSE', '2017-02-15'),
('HODECE01', 'Dr. Anitha Reddy', 'hod.ece@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'hod', 'ECE', '9876501235', 'Head of Department - ECE', '2016-08-20'),
('HODMECH01', 'Dr. Rajesh Verma', 'hod.mech@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'hod', 'MECH', '9876501236', 'Head of Department - Mechanical', '2018-05-10'),
('HODCIVIL01', 'Prof. Meena Krishnan', 'hod.civil@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'hod', 'CIVIL', '9876501237', 'Head of Department - Civil', '2019-11-30'),
('HODMGMT01', 'Dr. S. Karthik', 'hod.mgmt@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'hod', 'MGMT', '9876501238', 'Head of Department - Management', '2017-03-12'),
('HODPHYS01', 'Dr. R. Ganesh', 'hod.physics@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'hod', 'PHYSICS', '9876501240', 'Head of Physics Department', '2016-04-22'),
('HODCHEM01', 'Dr. P. Soundarya', 'hod.chemistry@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'hod', 'CHEM', '9876501241', 'Head of Chemistry Department', '2017-11-08'),
('HODMATH01', 'Dr. M. Sundar', 'hod.maths@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'hod', 'MATH', '9876501242', 'Head of Mathematics Department', '2015-08-30'),
('HODLIB01', 'Ms. Anita Desai', 'hod.library@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'hod', 'LIB', '9876501243', 'Chief Librarian', '2013-12-10'),

-- CSE Faculty
('FAC001', 'Keerthi V', 'keerthi.cse@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CSE', '9876505678', 'Assistant Professor', '2021-01-10'),
('FAC002', 'Arun Kumar', 'arun.cse@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CSE', '9876509876', 'Associate Professor', '2018-08-05'),
('FAC003', 'Deepa R', 'deepa.cse@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CSE', '9876512345', 'Assistant Professor', '2020-12-22'),
('FAC004', 'Sanjay Patel', 'sanjay.cse@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CSE', '9876512346', 'Professor', '2015-03-14'),
('FAC005', 'Priya Nair', 'priya.cse@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CSE', '9876512347', 'Assistant Professor', '2022-06-18'),

-- ECE Faculty
('FAC006', 'Vikram Singh', 'vikram.ece@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'ECE', '9876512348', 'Associate Professor', '2017-09-10'),
('FAC007', 'Anjali Mehta', 'anjali.ece@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'ECE', '9876512349', 'Assistant Professor', '2021-04-25'),
('FAC008', 'Rahul Bose', 'rahul.ece@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'ECE', '9876512350', 'Professor', '2014-11-30'),

-- Mechanical Faculty
('FAC009', 'Suresh Kumar', 'suresh.mech@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'MECH', '9876512351', 'Associate Professor', '2016-07-15'),
('FAC010', 'Geetha R', 'geetha.mech@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'MECH', '9876512352', 'Assistant Professor', '2020-02-28'),

-- Civil Faculty
('FAC011', 'Mohan Das', 'mohan.civil@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CIVIL', '9876512353', 'Professor', '2013-10-05'),
('FAC012', 'Shalini R', 'shalini.civil@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CIVIL', '9876512354', 'Associate Professor', '2019-08-12'),

-- Additional Faculty for other departments
('FAC013', 'Dr. R. Karthik', 'karthik.cse@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CSE', '9876512355', 'Professor', '2015-06-10'),
('FAC014', 'Dr. S. Anitha', 'anitha.ece@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'ECE', '9876512356', 'Associate Professor', '2016-08-22'),
('FAC015', 'Dr. P. Senthil', 'senthil.mech@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'MECH', '9876512357', 'Assistant Professor', '2018-03-15'),
('FAC016', 'Dr. Lakshmi Priya', 'lakshmipriya.cse@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CSE', '9876512358', 'Associate Professor', '2017-11-05'),
('FAC017', 'Dr. M. Rajan', 'rajan.civil@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CIVIL', '9876512359', 'Professor', '2014-09-18'),
('FAC018', 'Dr. Vasanthi', 'vasanthi.ece@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'ECE', '9876512360', 'Assistant Professor', '2019-02-28'),
('FAC019', 'Dr. S. Arjun', 'arjun.physics@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'PHYSICS', '9876512361', 'Associate Professor', '2016-12-10'),
('FAC020', 'Dr. Gayathri', 'gayathri.chemistry@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'CHEM', '9876512362', 'Professor', '2013-07-22'),
('FAC021', 'Dr. S. Raman', 'raman.maths@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'MATH', '9876512363', 'Professor', '2012-05-14'),
('FAC022', 'Dr. Meera', 'meera.physics@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'faculty', 'PHYSICS', '9876512364', 'Assistant Professor', '2020-09-18'),

-- Original Staff (STAFF01-STAFF03)
('STAFF01', 'Lakshmi', 'lakshmi.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'CSE', '9000001111', 'Office Assistant', '2019-10-12'),
('STAFF02', 'Ramesh', 'ramesh.admin@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'MGMT', '9000001112', 'Administrative Officer', '2018-06-20'),
('STAFF03', 'Sundar', 'sundar.library@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'LIB', '9000001113', 'Library Assistant', '2020-03-15'),

-- Support Staff (STAFF04-STAFF25)
('STAFF04', 'Geetha', 'geetha.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'ECE', '9000001114', 'Lab Assistant', '2021-01-10'),
('STAFF05', 'Murugan', 'murugan.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'MECH', '9000001115', 'Workshop Superintendent', '2017-11-05'),
('STAFF06', 'Priya', 'priya.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'CSE', '9000001116', 'Computer Lab Incharge', '2019-08-22'),
('STAFF07', 'Arun', 'arun.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'CIVIL', '9000001117', 'Technical Assistant', '2020-12-01'),
('STAFF08', 'Anjali', 'anjali.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'ECE', '9000001118', 'Electrical Lab Assistant', '2018-09-14'),
('STAFF09', 'Kumar', 'kumar.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'PHYSICS', '9000001119', 'Physics Lab Assistant', '2019-03-30'),
('STAFF10', 'Deepa', 'deepa.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'CHEM', '9000001120', 'Chemistry Lab Assistant', '2021-07-18'),
('STAFF11', 'Mohan', 'mohan.admin@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'MGMT', '9000001121', 'Accounts Officer', '2016-04-12'),
('STAFF12', 'Shanthi', 'shanthi.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'CSE', '9000001122', 'System Administrator', '2018-10-05'),
('STAFF13', 'Venkat', 'venkat.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'MECH', '9000001123', 'Store Keeper', '2017-02-28'),
('STAFF14', 'Radhika', 'radhika.library@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'LIB', '9000001124', 'Senior Library Assistant', '2015-11-20'),
('STAFF15', 'Gopal', 'gopal.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'ECE', '9000001125', 'Electronics Lab Technician', '2019-06-15'),
('STAFF16', 'Meena', 'meena.admin@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'MGMT', '9000001126', 'HR Coordinator', '2020-02-10'),
('STAFF17', 'Suresh', 'suresh.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'CIVIL', '9000001127', 'Survey Lab Assistant', '2018-07-25'),
('STAFF18', 'Padmini', 'padmini.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'CSE', '9000001128', 'Network Administrator', '2017-12-03'),
('STAFF19', 'Ravi', 'ravi.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'ECE', '9000001129', 'Power Lab Assistant', '2019-09-18'),
('STAFF20', 'Sarala', 'sarala.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'PHYSICS', '9000001130', 'Instrumentation Assistant', '2021-04-22'),
('STAFF21', 'Bala', 'bala.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'CHEM', '9000001131', 'Lab Supervisor', '2016-08-30'),
('STAFF22', 'Leela', 'leela.admin@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'MGMT', '9000001132', 'Administrative Assistant', '2020-11-07'),
('STAFF23', 'Chandran', 'chandran.library@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'LIB', '9000001133', 'Digital Library Assistant', '2018-05-19'),
('STAFF24', 'Vimala', 'vimala.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'MECH', '9000001134', 'CAD Lab Assistant', '2019-01-25'),
('STAFF25', 'Rajesh', 'rajesh.staff@cit.edu', '$2a$12$Cm12sTvXRqx895yHOIGl0OMAmMNlcySNehad3ubKB0EGLaF0e7hJu', 'staff', 'CSE', '9000001135', 'Database Administrator', '2017-07-14');

-- =====================================================================
-- UPDATE DEPARTMENTS WITH HOD INFORMATION
-- =====================================================================
UPDATE departments SET hod_id = 'HODCSE01' WHERE department_code = 'CSE';
UPDATE departments SET hod_id = 'HODECE01' WHERE department_code = 'ECE';
UPDATE departments SET hod_id = 'HODMECH01' WHERE department_code = 'MECH';
UPDATE departments SET hod_id = 'HODCIVIL01' WHERE department_code = 'CIVIL';
UPDATE departments SET hod_id = 'HODMGMT01' WHERE department_code = 'MGMT';
UPDATE departments SET hod_id = 'HODPHYS01' WHERE department_code = 'PHYSICS';
UPDATE departments SET hod_id = 'HODCHEM01' WHERE department_code = 'CHEM';
UPDATE departments SET hod_id = 'HODMATH01' WHERE department_code = 'MATH';
UPDATE departments SET hod_id = 'HODLIB01' WHERE department_code = 'LIB';

-- =====================================================================
-- HOLIDAYS (Academic Year 2025-2026 with realistic distribution)
-- =====================================================================
INSERT INTO holidays (date, name, description, academic_year) VALUES
-- 2025 Holidays
('2025-01-01', 'New Year''s Day', 'New Year Celebration', 2025),
('2025-01-14', 'Pongal', 'Harvest Festival', 2025),
('2025-01-15', 'Tamil Thai Pongal Day', 'State Holiday', 2025),
('2025-01-26', 'Republic Day', 'National Holiday', 2025),
('2025-03-08', 'Maha Shivaratri', 'Religious Holiday', 2025),
('2025-03-29', 'Good Friday', 'Religious Holiday', 2025),
('2025-04-14', 'Tamil New Year', 'Regional New Year', 2025),
('2025-05-01', 'Labour Day', 'International Workers Day', 2025),
('2025-06-15', 'Eid al-Fitr', 'Religious Holiday (approx date)', 2025),
('2025-08-15', 'Independence Day', 'National Holiday', 2025),
('2025-09-05', 'Teacher''s Day', 'Institution Holiday', 2025),
('2025-10-02', 'Gandhi Jayanti', 'National Holiday', 2025),
('2025-10-23', 'Vijayadashami', 'Dussehra', 2025),
('2025-12-25', 'Christmas', 'Festival Holiday', 2025),

-- 2026 Holidays (for forward planning)
('2026-01-01', 'New Year''s Day', 'New Year Celebration', 2026),
('2026-01-14', 'Pongal', 'Harvest Festival', 2026),
('2026-01-26', 'Republic Day', 'National Holiday', 2026),
('2026-03-25', 'Holi', 'Festival of Colors', 2026),
('2026-04-02', 'Good Friday', 'Religious Holiday', 2026),
('2026-04-14', 'Tamil New Year', 'Regional New Year', 2026),
('2026-08-15', 'Independence Day', 'National Holiday', 2026),
('2026-10-02', 'Gandhi Jayanti', 'National Holiday', 2026),
('2026-12-25', 'Christmas', 'Festival Holiday', 2026);

-- =====================================================================
-- LEAVE_REQUESTS (Realistic mix of statuses and scenarios)
-- =====================================================================
INSERT INTO leave_requests (user_id, department_code, leave_type, start_date, start_session, end_date, end_session, reason, hod_status, principal_status, final_status, applied_on) VALUES
-- PENDING REQUESTS (for testing approval flows)
('FAC001', 'CSE', 'Casual Leave', '2025-04-10', 'Forenoon', '2025-04-10', 'Afternoon', 'Medical checkup', 'pending', NULL, 'pending', '2025-03-28 09:15:00'),
('FAC002', 'CSE', 'Earned Leave', '2025-04-15', 'Forenoon', '2025-04-17', 'Afternoon', 'Family function', 'pending', NULL, 'pending', '2025-03-29 10:30:00'),
('FAC003', 'CSE', 'OOD', '2025-04-20', 'Forenoon', '2025-04-21', 'Afternoon', 'Conference attendance', 'pending', NULL, 'pending', '2025-03-30 11:45:00'),
('FAC006', 'ECE', 'Casual Leave', '2025-04-05', 'Afternoon', '2025-04-05', 'Afternoon', 'Personal work', 'pending', NULL, 'pending', '2025-03-27 14:20:00'),
('FAC010', 'MECH', 'Earned Leave', '2025-06-01', 'Forenoon', '2025-06-05', 'Afternoon', 'Summer vacation with family', 'pending', NULL, 'pending', '2025-05-20 10:00:00'),
('FAC012', 'CIVIL', 'Permitted Leave', '2025-06-15', 'Forenoon', '2025-06-16', 'Forenoon', '1.5 days for house warming', 'pending', NULL, 'pending', '2025-06-01 14:15:00'),

-- APPROVED REQUESTS (with HOD approval)
('FAC001', 'CSE', 'Casual Leave', '2025-03-10', 'Forenoon', '2025-03-10', 'Afternoon', 'Dentist appointment', 'approved', NULL, 'approved', '2025-03-05 09:30:00'),
('FAC002', 'CSE', 'Earned Leave', '2025-03-12', 'Forenoon', '2025-03-14', 'Afternoon', 'Vacation', 'approved', NULL, 'approved', '2025-03-01 10:15:00'),
('FAC007', 'ECE', 'Casual Leave', '2025-03-18', 'Forenoon', '2025-03-18', 'Afternoon', 'Vehicle service', 'approved', NULL, 'approved', '2025-03-10 11:40:00'),
('FAC009', 'MECH', 'Special Casual Leave', '2025-03-22', 'Forenoon', '2025-03-22', 'Afternoon', 'Wedding ceremony', 'approved', NULL, 'approved', '2025-03-15 14:25:00'),
('FAC011', 'CIVIL', 'Casual Leave', '2025-06-10', 'Afternoon', '2025-06-10', 'Afternoon', 'Half day for personal work', 'approved', NULL, 'approved', '2025-05-25 11:30:00'),

-- REJECTED REQUESTS (with HOD rejection)
('FAC003', 'CSE', 'Casual Leave', '2025-03-25', 'Forenoon', '2025-03-26', 'Afternoon', 'Personal trip', 'rejected', NULL, 'rejected', '2025-03-20 08:45:00'),
('FAC008', 'ECE', 'Earned Leave', '2025-03-28', 'Forenoon', '2025-03-30', 'Afternoon', 'Family vacation', 'rejected', NULL, 'rejected', '2025-03-18 10:10:00'),

-- REQUIRING PRINCIPAL APPROVAL (OOD with HOD approved)
('FAC004', 'CSE', 'OOD', '2025-05-10', 'Forenoon', '2025-05-12', 'Afternoon', 'Research paper presentation at IIT Delhi', 'approved', 'pending', 'pending', '2025-04-25 09:00:00'),
('FAC005', 'CSE', 'OOD', '2025-05-15', 'Forenoon', '2025-05-18', 'Afternoon', 'International conference in Singapore', 'approved', 'pending', 'pending', '2025-04-28 10:30:00'),

-- PRINCIPAL APPROVED (OOD requests)
('FAC001', 'CSE', 'OOD', '2025-02-10', 'Forenoon', '2025-02-12', 'Afternoon', 'Workshop at Anna University', 'approved', 'approved', 'approved', '2025-01-25 11:15:00'),
('FAC002', 'CSE', 'OOD', '2025-02-20', 'Forenoon', '2025-02-22', 'Afternoon', 'Industry visit to TCS Chennai', 'approved', 'approved', 'approved', '2025-01-30 14:45:00'),

-- CANCELLED LEAVES
('FAC003', 'CSE', 'Casual Leave', '2025-03-05', 'Forenoon', '2025-03-05', 'Afternoon', 'Event postponed', 'approved', NULL, 'cancelled', '2025-02-28 09:20:00'),

-- STAFF LEAVE REQUESTS (for role testing)
('STAFF01', 'CSE', 'Casual Leave', '2025-04-08', 'Forenoon', '2025-04-08', 'Afternoon', 'Medical appointment', 'approved', NULL, 'approved', '2025-03-30 08:45:00'),
('STAFF02', 'ADMIN', 'Earned Leave', '2025-04-25', 'Forenoon', '2025-04-28', 'Afternoon', 'Family wedding', 'pending', NULL, 'pending', '2025-04-10 10:20:00'),
('STAFF12', 'CSE', 'Casual Leave', '2025-04-12', 'Afternoon', '2025-04-12', 'Afternoon', 'Vehicle registration', 'approved', NULL, 'approved', '2025-04-01 14:30:00'),

-- RECENT LEAVES (for current date testing)
('FAC001', 'CSE', 'Casual Leave', CURDATE() + INTERVAL 3 DAY, 'Forenoon', CURDATE() + INTERVAL 3 DAY, 'Afternoon', 'Parent-Teacher meeting', 'pending', NULL, 'pending', CURDATE() + INTERVAL -1 DAY),
('FAC002', 'CSE', 'Casual Leave', CURDATE() + INTERVAL 7 DAY, 'Forenoon', CURDATE() + INTERVAL 9 DAY, 'Afternoon', 'Outstation work', 'pending', NULL, 'pending', CURDATE() + INTERVAL -2 DAY);

-- =====================================================================
-- ARRANGEMENTS (Substitute arrangements for leave requests)
-- =====================================================================
INSERT INTO arrangements (leave_id, substitute_id, department_code, details, status, responded_on) VALUES
-- PENDING substitute requests
(1, 'FAC002', 'CSE', 'Please handle Data Structures lab on April 10', 'pending', NULL),
(2, 'FAC001', 'CSE', 'Cover Database classes from April 15-17', 'pending', NULL),
(3, 'FAC004', 'CSE', 'Take Web Technology practical on April 20', 'pending', NULL),
(4, 'FAC008', 'ECE', 'Handle Digital Electronics lecture on April 5', 'pending', NULL),
(5, 'FAC015', 'MECH', 'Cover Thermodynamics classes June 1-5', 'pending', NULL),
(6, 'FAC017', 'CIVIL', 'Handle Surveying lab on June 15-16', 'pending', NULL),

-- ACCEPTED substitute requests
(7, 'FAC003', 'CSE', 'Covered AI lecture on March 10', 'accepted', '2025-03-08 16:30:00'),
(8, 'FAC005', 'CSE', 'Took OS and Networking classes March 12-14', 'accepted', '2025-03-10 15:45:00'),
(9, 'FAC006', 'ECE', 'Handled Signals class on March 18', 'accepted', '2025-03-15 14:20:00'),
(10, 'FAC010', 'MECH', 'Covered Workshop practice on March 22', 'accepted', '2025-03-18 11:30:00'),
(11, 'FAC012', 'CIVIL', 'Took Environmental Engineering class on June 10', 'accepted', '2025-06-05 10:15:00'),

-- REJECTED substitute requests
(12, 'FAC010', 'MECH', 'Thermodynamics lab on March 22', 'rejected', '2025-03-20 11:10:00'),
(13, 'FAC007', 'ECE', 'Cover EM theory classes on March 25-26', 'rejected', '2025-03-22 10:05:00'),

-- CANCELLED substitute requests
(14, 'FAC016', 'CSE', 'Network Security classes for cancelled leave', 'cancelled', '2025-03-01 09:20:00'),

-- CROSS-DEPARTMENT substitute arrangements
(15, 'FAC019', 'PHYSICS', 'Cover Physics practical for CSE staff', 'accepted', '2025-03-28 14:45:00'),
(16, 'STAFF12', 'CSE', 'System maintenance during admin leave', 'accepted', '2025-04-03 16:20:00'),

-- MULTIPLE substitutes for same leave (testing scenario)
(7, 'FAC016', 'CSE', 'Backup substitute for AI lecture', 'accepted', '2025-03-08 17:15:00');

-- =====================================================================
-- NOTIFICATIONS (Realistic notification history)
-- =====================================================================
INSERT INTO notifications (receiver_id, sender_id, message, type, status, related_leave_id) VALUES
-- Unread notifications (current)
('FAC001', 'HODCSE01', 'Your leave for April 10 is pending substitute arrangement', 'warning', 'unread', 1),
('HODCSE01', 'FAC002', 'New leave request from Arun Kumar for April 15-17', 'info', 'unread', 2),
('FAC002', 'FAC001', 'Keerthi V requested you as substitute for April 10', 'info', 'unread', 1),
('PRINC001', 'HODCSE01', 'OOD request from Sanjay Patel requires principal approval', 'warning', 'unread', 19),
('HODMECH01', 'FAC010', 'New leave request from Geetha R for June 1-5', 'info', 'unread', 5),
('FAC004', 'FAC003', 'Deepa R requested you as substitute for April 20', 'info', 'unread', 3),

-- Read notifications (historical)
('FAC001', 'HODCSE01', 'Your leave for March 10 has been approved', 'success', 'read', 7),
('FAC003', 'HODCSE01', 'Your leave request for March 25-26 has been rejected', 'error', 'read', 12),
('FAC005', 'FAC001', 'Thank you for accepting substitute arrangement', 'success', 'read', 8),
('HODCSE01', 'SYSTEM', 'Reminder: 2 pending leave requests need your attention', 'warning', 'read', NULL),
('FAC004', 'PRINC001', 'Your OOD request for February 10-12 has been approved by principal', 'success', 'read', 21),
('FAC008', 'HODECE01', 'Your leave request for March 28-30 has been rejected due to exam schedule', 'error', 'read', 13),
('STAFF01', 'HODCSE01', 'Your casual leave for April 8 has been approved', 'success', 'read', 23),
('FAC010', 'FAC009', 'Your substitute request for March 22 has been rejected', 'error', 'read', 12),

-- Multiple notifications for same user (testing notification count)
('FAC001', 'SYSTEM', 'Welcome to Faculty Leave Management System', 'info', 'read', NULL),
('FAC001', 'SYSTEM', 'Your password was last changed 90 days ago', 'warning', 'read', NULL),
('FAC001', 'ADMIN01', 'System maintenance scheduled for April 1, 2:00 AM - 4:00 AM', 'info', 'read', NULL),
('FAC002', 'SYSTEM', 'Leave balance updated for academic year 2025', 'info', 'read', NULL),
('FAC002', 'HODCSE01', 'Your earned leave application needs additional details', 'warning', 'read', 2),
('HODCSE01', 'SYSTEM', 'Weekly report: 5 approved, 2 rejected, 3 pending leaves', 'info', 'read', NULL),
('PRINC001', 'SYSTEM', '2 OOD requests pending your approval', 'warning', 'read', NULL);

-- =====================================================================
-- LEAVE_BALANCE (Manual updates for realistic scenarios)
-- =====================================================================
-- Update some leave balances to show usage (triggers created initial balances)
UPDATE leave_balance SET 
    casual_used = 3,
    rh_used = 1,
    earned_used = 2
WHERE user_id IN ('FAC001', 'FAC002', 'FAC003');

UPDATE leave_balance SET 
    casual_used = 5,
    earned_used = 4
WHERE user_id = 'FAC004';

UPDATE leave_balance SET 
    casual_used = 8  -- Almost exhausted
WHERE user_id = 'FAC007';

UPDATE leave_balance SET 
    casual_used = 12,  -- Fully exhausted
    rh_used = 3        -- Fully exhausted
WHERE user_id = 'FAC009';

UPDATE leave_balance SET 
    casual_used = 6,
    earned_used = 3,
    rh_used = 2
WHERE user_id = 'FAC001' AND academic_year = 2025;

UPDATE leave_balance SET 
    casual_used = 4,
    earned_used = 5
WHERE user_id = 'FAC002' AND academic_year = 2025;

UPDATE leave_balance SET 
    casual_used = 9  -- Very low balance
WHERE user_id = 'FAC005' AND academic_year = 2025;

UPDATE leave_balance SET 
    casual_used = 2,
    rh_used = 1
WHERE user_id = 'STAFF01' AND academic_year = 2025;

UPDATE leave_balance SET 
    casual_used = 7,
    earned_used = 6
WHERE user_id = 'STAFF02' AND academic_year = 2025;

-- =====================================================================
-- PASSWORD_RESET_REQUESTS (Testing data)
-- =====================================================================
INSERT INTO password_reset_requests (user_id, email, status, created_at) VALUES
('FAC005', 'priya.cse@cit.edu', 'pending', '2025-03-28 14:30:00'),
('FAC008', 'rahul.ece@cit.edu', 'resolved', '2025-03-25 10:15:00'),
('STAFF01', 'lakshmi.staff@cit.edu', 'pending', '2025-03-29 09:45:00'),
('FAC003', 'deepa.cse@cit.edu', 'expired', '2025-03-20 16:20:00'),
('STAFF12', 'shanthi.staff@cit.edu', 'pending', CURDATE());

-- =====================================================================
-- MAIL_QUEUE (Sample email queue entries)
-- =====================================================================
INSERT INTO mail_queue (to_email, subject, body, status, attempts) VALUES
('keerthi.cse@cit.edu', 'Leave Request Submitted', 'Your leave request has been submitted successfully', 'sent', 1),
('hod.cse@cit.edu', 'New Leave Request for Approval', 'You have a new leave request pending approval', 'sent', 1),
('arun.cse@cit.edu', 'Substitute Request', 'You have been requested as substitute for a class', 'pending', 0),
('principal@cit.edu', 'OOD Request Requires Approval', 'An OOD leave request requires your attention', 'pending', 0),
('deepa.cse@cit.edu', 'Leave Request Status Update', 'Your leave request status has been updated', 'failed', 2),
('hod.mech@cit.edu', 'Pending Leave Requests', '3 leave requests require your attention', 'sent', 1),
('geetha.mech@cit.edu', 'Substitute Request Accepted', 'Your substitute request has been accepted', 'sent', 1),
('admin@cit.edu', 'System Alert: Failed Emails', '2 emails failed to send in the last hour', 'pending', 0);

-- =====================================================================
-- SAMPLE QUERIES FOR VERIFICATION
-- =====================================================================

-- Summary of all tables
SELECT 'Departments' as table_name, COUNT(*) as record_count FROM departments
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
SELECT 'Password Reset Requests', COUNT(*) FROM password_reset_requests
UNION ALL
SELECT 'Mail Queue', COUNT(*) FROM mail_queue;

-- Leave status distribution
SELECT 
    final_status as status,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT leave_type) as leave_types
FROM leave_requests 
GROUP BY final_status 
ORDER BY count DESC;

-- Department-wise leave requests
SELECT 
    d.department_name,
    COUNT(lr.leave_id) as total_requests,
    SUM(CASE WHEN lr.final_status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN lr.final_status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN lr.final_status = 'rejected' THEN 1 ELSE 0 END) as rejected
FROM departments d
LEFT JOIN leave_requests lr ON d.department_code = lr.department_code
GROUP BY d.department_code, d.department_name
ORDER BY total_requests DESC;

-- User leave balance overview
SELECT 
    u.user_id,
    u.name,
    u.role,
    d.department_name,
    lb.casual_total - lb.casual_used as casual_remaining,
    lb.earned_total - lb.earned_used as earned_remaining,
    lb.rh_total - lb.rh_used as rh_remaining
FROM users u
LEFT JOIN leave_balance lb ON u.user_id = lb.user_id AND lb.academic_year = 2025
LEFT JOIN departments d ON u.department_code = d.department_code
WHERE u.role IN ('faculty', 'hod', 'staff')
ORDER BY d.department_name, u.name;

-- Pending actions for HODs
SELECT 
    u.user_id as hod_id,
    u.name as hod_name,
    d.department_name,
    COUNT(DISTINCT lr.leave_id) as pending_leaves,
    COUNT(DISTINCT n.notification_id) as unread_notifications
FROM users u
JOIN departments d ON u.user_id = d.hod_id
LEFT JOIN leave_requests lr ON d.department_code = lr.department_code 
    AND lr.hod_status = 'pending' 
    AND lr.final_status = 'pending'
LEFT JOIN notifications n ON u.user_id = n.receiver_id AND n.status = 'unread'
WHERE u.role = 'hod'
GROUP BY u.user_id, u.name, d.department_name;

-- Substitute request summary
SELECT 
    a.status,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT lr.leave_type) as leave_types_involved
FROM arrangements a
LEFT JOIN leave_requests lr ON a.leave_id = lr.leave_id
GROUP BY a.status;

-- Active leave requests (current and future)
SELECT 
    lr.leave_id,
    u.name as requester,
    d.department_name,
    lr.leave_type,
    lr.start_date,
    lr.end_date,
    lr.final_status,
    COUNT(a.arrangement_id) as substitute_count
FROM leave_requests lr
JOIN users u ON lr.user_id = u.user_id
JOIN departments d ON lr.department_code = d.department_code
LEFT JOIN arrangements a ON lr.leave_id = a.leave_id
WHERE lr.end_date >= CURDATE()
GROUP BY lr.leave_id, u.name, d.department_name, lr.leave_type, lr.start_date, lr.end_date, lr.final_status
ORDER BY lr.start_date;

-- Data integrity check
SELECT 'Data integrity check completed successfully' as check_result;