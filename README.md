# Leave Management System - CIT (LMS-CIT)

A comprehensive web-based Leave Management System designed for educational institutions, built with modern React.js frontend and Express.js backend with MySQL database.

## 🚀 Live Demo
- **Frontend**: [Coming Soon]
- **Backend API**: [Coming Soon]
- **Demo Credentials**: [Check Wiki](https://github.com/keerthivasan91/LMS-CIT/wiki)

## ✨ Features

### 👤 User Features
- **🔐 Multi-role Authentication** (Student, Faculty, HOD, Principal, Admin, Staff)
- **📝 Leave Application & Tracking** with real-time status
- **🔔 Real-time Notifications** (Email & In-app)
- **📅 Holiday Calendar Integration**
- **📊 Leave History & Analytics**
- **👤 Profile Management**
- **📱 Fully Responsive Design**
- **🔄 Session-based Authentication** (Secure cookies)
- **🔑 Password Reset System** (Admin-assisted)

### 🛠 Administrative Features
- **⚡ Multi-level Approval Workflow** (Substitute → HOD → Principal)
- **💰 Leave Balance Management** (Auto-calculated)
- **🏫 Class Arrangement Automation**
- **📈 Analytics & Reports Dashboard**
- **👥 Bulk User Operations** (Add/Delete/Reactivate)
- **⚙️ System Configuration**
- **📧 Asynchronous Email Queue** (Background worker)

## 🛠 Tech Stack

### Frontend
- **⚛️ React.js 18** - UI Framework with Hooks
- **⚡ Vite** - Next Generation Build Tool
- **🔗 React Router v6** - Navigation
- **📡 Axios** - HTTP Client with session support

### Backend
- **🟢 Node.js** - Runtime Environment
- **🚂 Express.js** - Web Framework
- **🗄️ MySQL 8.0** - Database
- **🔐 express-session** - Session Management
- **🍪 express-mysql-session** - Session Store
- **🔒 Helmet** - Security Headers
- **📧 Nodemailer** - Email Service
- **💬 Twilio** - SMS Service (Optional)
- **📋 Winston** - Logging System

### Development & Deployment
- **🐳 Docker & Docker Compose** - Containerization
- **🔄 Nodemon** - Development Server
- **🧪 Jest & Supertest** - Testing Framework
- **📝 ESLint & Prettier** - Code Quality
- **🐙 GitHub Actions** - CI/CD Pipeline

## 📁 Project Structure

```
LMS-CIT/
│
├── client/                     # Frontend (React.js)
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── logo.png
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosConfig.js  # Axios setup with credentials
│   │   │
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.jsx      # Main layout wrapper
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LeaveForm.jsx
│   │   │   └── NotificationBell.jsx
│   │   │
│   │   ├── pages/              # Route pages
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ApplyLeave.jsx
│   │   │   ├── LeaveHistory.jsx
│   │   │   ├── SubstituteRequests.jsx
│   │   │   ├── Holidays.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ChangePassword.jsx
│   │   │   ├── HODApproval.jsx
│   │   │   ├── HODLeaveBalance.jsx
│   │   │   ├── PrincipalApprovals.jsx
│   │   │   ├── AdminAddUser.jsx
│   │   │   ├── DeleteAdminUser.jsx
│   │   │   └── AdminResetRequests.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Session management
│   │   │
│   │   ├── utils/
│   │   │   ├── dateFormatter.js
│   │   │   ├── roles.js
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── App.css             # Global styles
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # React entry point
│   │
│   ├── package.json
│   ├── .env                    # Frontend API base URL
│   └── vite.config.js
│
├── server/                     # Backend (Express + MySQL)
│   ├── app.js                  # Express app setup
│   ├── server.js               # Server start file
│   ├── package.json
│   ├── .env                    # Secrets & DB credentials
│   │
│   ├── config/
│   │   ├── db.js               # MySQL connection pool
│   │   ├── mailer.js           # Nodemailer + Queue system
│   │   └── sms.js              # Twilio SMS
│   │
│   ├── routes/
│   │   ├── auth.js             # Login, logout, /me
│   │   ├── branches.js         # Departments & faculty lists
│   │   ├── leave.js            # Apply, history
│   │   ├── substitute.js       # Accept/reject requests
│   │   ├── hod.js              # HOD approvals
│   │   ├── admin.js            # Principal approvals
│   │   ├── profile.js          # User profile & balance
│   │   ├── holiday.js          # Holiday calendar
│   │   ├── changepassword.js   # User password change
│   │   ├── forgotpassword.js   # Password reset request
│   │   └── notifications.js    # Notification counters
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leaveController.js
│   │   ├── hodController.js
│   │   ├── adminController.js
│   │   ├── profileController.js
│   │   ├── substituteController.js
│   │   ├── branchController.js
│   │   ├── holidaycontroller.js
│   │   ├── notificationController.js
│   │   ├── changePasswordController.js
│   │   ├── forgotPasswordRequest.js
│   │   ├── adminAddUser.js
│   │   ├── adminDeleteUser.js
│   │   └── adminResetPassword.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Leave.js
│   │   ├── Admin.js
│   │   └── profile.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js   # Session-based auth
│   │   ├── errorHandler.js
│   │   └── rateLimit.js
│   │
│   ├── services/
│   │   ├── hodService.js       # HOD business logic
│   │   └── logger.js           # Winston logger
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   ├── sqlHelpers.js
│   │   └── mailQueue.js        # Email queueing
│   │
│   ├── workers/
│   │   └── mailWorker.js       # Background email sender
│   │
│   ├── data/
│   │   ├── schema.sql          # Database schema
│   │   └── seed.sql            # Sample data
│   │
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── leave.test.js
│   │   ├── hod.test.js
│   │   ├── setup.js
│   │   ├── globalTeardown.js
│   │   ├── Unit/
│   │   │   ├── adminAddUser.unit.test.js
│   │   │   └── sessionAuth.unit.test.js
│   │   └── integration/
│   │       ├── auth.int.test.js
│   │       └── adminRoutes.int.test.js
│   │
│   └── logs/                   # Winston logs
│       ├── access.log
│       └── error.log
│
├── nginx/
│   └── nginx.conf              # Reverse proxy config
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **pnpm** (recommended) or npm

### 📥 Installation

#### 1. Clone the repository
```bash
git clone https://github.com/keerthivasan91/LMS-CIT.git
cd LMS-CIT
```

#### 2. Backend Setup
```bash
cd server
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials
```

#### 3. Database Setup
```bash
# Import schema
mysql -u root -p < data/schema.sql

# Import seed data (optional)
mysql -u root -p lms_cit < data/seed.sql
```

#### 4. Frontend Setup
```bash
cd ../client
pnpm install
```

### Running the Application

#### Development Mode:

**Start Backend Server**
```bash
cd server
pnpm run dev
# Server runs on http://localhost:5000
```

**Start Frontend Server**
```bash
cd client
pnpm run dev
# Client runs on http://localhost:3000
```

#### Production Mode:
```bash
# Using Docker
docker-compose up --build
```

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=lms_cit
DB_PORT=3306

# Session
SESSION_SECRET=your_session_secret_key_here

# JWT (Legacy - kept for compatibility)
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

# Email (Nodemailer)
MAIL_SERVICE=gmail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# Admin Email (for notifications)
ADMIN_EMAIL=admin@cit.edu

# SMS (Twilio - Optional)
TWILIO_SID=your_twilio_account_sid
TWILIO_TOKEN=your_twilio_auth_token
TWILIO_FROM=your_twilio_phone_number

# Server
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

#### Client (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
```

## 📊 Database Schema

### Key Tables:
- **users** - User accounts (faculty, HOD, staff, admin, principal)
- **departments** - Department information
- **leave_requests** - Leave applications with multi-level approval
- **arrangements** - Substitute assignments
- **leave_balance** - User leave balances (auto-managed)
- **holidays** - Institutional holidays
- **notifications** - In-app notifications
- **password_reset_requests** - Admin-assisted password resets
- **mail_queue** - Asynchronous email queue
- **sessions** - Session storage (managed by express-mysql-session)
- **activity_log** - Audit trail

### Computed Fields:
- **days** - Auto-calculated based on start/end dates and sessions

### Triggers:
- **trg_add_leave_balance** - Auto-creates leave balance on user insert

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Student** | View holidays, profile |
| **Staff** | Apply leave, view history, select faculty substitutes |
| **Faculty** | Apply leave, view history, accept/reject substitute requests |
| **HOD** | All faculty permissions + approve department leaves, view leave balance |
| **Principal** | Final leave approval, institution-wide overview |
| **Admin** | User management, system configuration, password resets |

## 🔄 Leave Workflow

### Standard Flow:
1. **Application** → User submits leave request
2. **Substitute (Optional)** → If substitute selected, they approve/reject
3. **HOD Review** → Department head approval
4. **Principal Review** → Final institutional approval
5. **Notification** → Email confirmation
6. **Balance Update** → Automatic leave deduction

### Special Cases:
- **HOD Leave without Substitute** → Skips HOD approval, goes directly to Principal
- **HOD Leave with Substitute** → Follows substitute → Principal flow
- **Substitute Rejection** → Leave auto-rejected, no further processing

## 📧 Notifications

### Email System:
- **Asynchronous Queue** - Emails queued in `mail_queue` table
- **Background Worker** - Processes queue every 60 seconds
- **Retry Logic** - Failed emails marked for retry

### Notification Types:
- Leave application submitted
- Substitute request assigned
- Substitute accepted/rejected
- HOD approved/rejected
- Principal approved/rejected
- Password reset confirmation

### In-app Notifications:
- Real-time counters in sidebar
- Pending substitute requests
- Pending HOD approvals
- Pending principal approvals

## 🔒 Security Features

- **Session-based Authentication** (No JWT tokens in localStorage)
- **HTTP-only Cookies** (XSS protection)
- **CSRF Protection** (SameSite cookies)
- **Helmet.js** (Security headers)
- **Rate Limiting** (Prevents brute-force)
- **SQL Injection Prevention** (Prepared statements)
- **Password Hashing** (bcrypt)
- **Session Regeneration** (Prevents fixation)

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
pnpm test

# Run specific test suite
pnpm test auth.test.js

# Coverage report
pnpm test --coverage
```

### Test Structure:
- **Unit Tests** - Controller and middleware logic
- **Integration Tests** - API endpoints with database
- **Setup/Teardown** - Automatic test data cleanup

## 📦 Deployment

### Using Docker
```bash
docker-compose up --build -d
```

### Manual Deployment

#### Backend:
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `SESSION_SECRET`
4. Enable HTTPS
5. Configure reverse proxy (Nginx)

#### Frontend:
1. Build production bundle:
   ```bash
   cd client
   pnpm run build
   ```
2. Serve `dist/` folder via Nginx or Express static

#### Database:
1. Run schema in production DB
2. Set up automated backups
3. Configure connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - Login with session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Destroy session

### Leave Management
- `POST /api/apply` - Apply for leave
- `GET /api/leave_history` - Get leave history

### Substitute Management
- `GET /api/substitute/requests` - Get assigned requests
- `POST /api/substitute/accept/:id` - Accept request
- `POST /api/substitute/reject/:id` - Reject request

### HOD Routes
- `GET /api/hod/requests` - Get pending approvals
- `POST /api/hod/approve/:id` - Approve leave
- `POST /api/hod/reject/:id` - Reject leave
- `GET /api/hod/leave_balance` - Department balances

### Admin Routes
- `GET /api/admin/requests` - Principal pending
- `POST /api/admin/approve/:id` - Final approval
- `POST /api/admin/reject/:id` - Final rejection
- `POST /api/add-user` - Add new user
- `DELETE /api/admin/delete-user/:id` - Delete user
- `GET /api/admin/reset-requests` - Password reset queue

For detailed API documentation, refer to the [API Docs](./api-docs.md).

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
- Verify MySQL service is running
- Check environment variables in `.env`
- Ensure database `lms_cit` exists

#### Session Not Persisting
- Check `SESSION_SECRET` is set
- Verify `withCredentials: true` in axios config
- Ensure cookies are enabled in browser

#### Email Not Sending
- Verify SMTP credentials
- Check `mail_queue` table for failed emails
- Review server logs in `logs/error.log`

#### Frontend Slow Performance
- Clear browser cache
- Check network tab for slow API calls
- Verify backend is running in production mode

## ⚡ Performance Optimization Tips

### Backend:
- Use connection pooling (already configured)
- Enable MySQL query caching
- Implement Redis for session storage (future enhancement)
- Monitor with Winston logs

### Frontend:
- Use React.memo() for expensive components
- Implement lazy loading for routes
- Add virtualization for large tables
- Minimize API calls with caching

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developers

- **Keerthivasan** - [GitHub](https://github.com/keerthivasan91)
- **Institution**: CIT

## 🙏 Acknowledgments

- React.js community
- Express.js team
- MySQL developers
- All contributors and testers

---

**Version**: 2.0.0  
**Last Updated**: November 26, 2025  
**Status**: Active Development