# Leave Management System - CIT (LMS-CIT)

A comprehensive web-based Leave Management System designed for educational institutions, built with React.js frontend and Express.js backend with MySQL database.

## 🚀 Features

### User Features
- **Multi-role Authentication** (Student, Faculty, HOD, Principal, Admin)
- **Leave Application & Tracking**
- **Real-time Notifications** (Email & SMS)
- **Holiday Calendar Integration**
- **Leave History & Status**
- **Profile Management**
- **Responsive Design**

### Administrative Features
- **Multi-level Approval Workflow**
- **Leave Balance Management**
- **Class Arrangement Automation**
- **Analytics & Reports**
- **Bulk Operations**

## 🛠 Tech Stack

### Frontend
- **React.js** - UI Framework
- **Vite** - Build Tool
- **Axios** - HTTP Client
- **React Router** - Navigation
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MySQL** - Database
- **JWT** - Authentication
- **Nodemailer** - Email Service
- **Twilio** - SMS Service

### Development Tools
- **Git** - Version Control
- **Docker** - Containerization
- **Nodemon** - Development Server
- **Jest** - Testing Framework

## 📁 Project Structure

```
LMS-CIT/
│
├── client/                     # Frontend (React.js)
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosConfig.js  # Base Axios setup for API requests
│   │   │
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LeaveForm.jsx
│   │   │   ├── LeaveTable.jsx
│   │   │   └── NotificationBell.jsx
│   │   │
│   │   ├── pages/              # Each page (routed via React Router)
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ApplyLeave.jsx
│   │   │   ├── LeaveHistory.jsx
│   │   │   ├── Holidays.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── HODApproval.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global user/session management
│   │   │
│   │   ├── utils/
│   │   │   ├── dateFormatter.js
│   │   │   └── roles.js
│   │   │
│   │   ├── styles/
│   │   │   └── main.css
│   │   │
│   │   ├── App.jsx             # Root component
│   │   ├── index.js            # React entry point
│   │   └── routes.js           # React Router configuration
│   │
│   ├── package.json
│   ├── .env                    # Frontend API base URL
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Backend (Express + MySQL)
│   ├── app.js                  # Express app setup
│   ├── server.js               # Server start file
│   ├── package.json
│   ├── .env                    # Secrets & DB credentials
│   ├── Dockerfile
│   │
│   ├── config/
│   │   ├── db.js               # MySQL connection pool
│   │   ├── mailer.js           # Nodemailer config
│   │   └── sms.js              # Twilio setup for SMS
│   │
│   ├── routes/                 # Express route files
│   │   ├── authRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── hodRoutes.js
│   │   ├── profileRoutes.js
│   │   └── index.js            # Combines all routes
│   │
│   ├── controllers/            # Logic for each feature
│   │   ├── authController.js
│   │   ├── leaveController.js
│   │   ├── hodController.js
│   │   └── profileController.js
│   │
│   ├── models/                 # Database interaction layer
│   │   ├── User.js
│   │   ├── Leave.js
│   │   ├── Holiday.js
│   │   └── Notification.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── roleMiddleware.js
│   │
│   ├── services/
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   └── logger.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── validators.js
│   │   └── formatters.js
│   │
│   ├── data/
│   │   └── schema.sql          # Database schema + sample data
│   │
│   ├── logs/
│   │   ├── access.log
│   │   └── error.log
│   │
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── leave.test.js
│   │   └── hod.test.js
│   │
│   └── README.md               # Server documentation
│
├── nginx/
│   └── nginx.conf              # Reverse proxy, HTTPS, and static serve
│
├── docker-compose.yml          # Runs client + server + MySQL + Nginx
└── README.md                   # Main project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/your-username/LMS-CIT.git
    cd LMS-CIT
    ```

2. **Backend Setup**
    ```bash
    cd server
    npm install

    # Configure environment variables
    cp .env.example .env
    # Edit .env with your database credentials
    ```

3. **Database Setup**
    ```bash
    # Import schema
    mysql -u root -p < data/schema.sql
    ```

4. **Frontend Setup**
    ```bash
    cd ../client
    npm install
    ```

### Running the Application

#### Development Mode:

**Start Backend Server**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Start Frontend Server**
```bash
cd client
npm run dev
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
DB_NAME=lms_cit
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

# Email (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Server
PORT=5000
NODE_ENV=development
```

#### Client (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📊 Database Schema

### Key Tables:
- **users** - User accounts and profiles
- **leaves** - Leave applications
- **holidays** - Institutional holidays
- **leave_balances** - User leave balances
- **notifications** - System notifications
- **arrangements** - Class arrangements during leaves

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Student | Apply leave, View history, Check calendar |
| Faculty | Apply leave, View history, Check calendar |
| HOD | Approve/reject leaves, View department reports |
| Principal | Final approval, Institutional overview |
| Admin | User management, System configuration |

## 🔄 Leave Workflow

1. **Application** → User submits leave request
2. **HOD Review** → Department head approval
3. **Principal Review** → Final institutional approval
4. **Notification** → Email/SMS confirmation
5. **Arrangement** → Automatic class scheduling

## 📧 Notifications

- **Email**: Leave status updates, approvals, rejections
- **SMS**: Urgent notifications, immediate responses
- **In-app**: Real-time notification center

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests  
cd client
npm test
```

## 📦 Deployment

### Using Docker
```bash
docker-compose up --build -d
```

### Manual Deployment
1. Build frontend: `cd client && npm run build`
2. Serve built files with backend static serving
3. Configure production environment variables
4. Set up reverse proxy (Nginx)
5. Configure SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Documentation

API endpoints are organized by modules:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Leaves**: `/api/leaves/*`
- **HOD**: `/api/hod/*`
- **Principal**: `/api/principal/*`
- **Notifications**: `/api/notifications/*`

For detailed API documentation, refer to the [API Docs](./api-docs.md).

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
- Verify MySQL service is running
- Check environment variables
- Ensure database exists

#### Authentication Issues
- Verify JWT secret in environment
- Check token expiration settings

#### Email/SMS Not Working
- Verify service credentials
- Check internet connectivity
- Review service provider limits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developers

- **Your Name** - [GitHub](https://github.com/your-username)
- **Institution**: CIT

## 🙏 Acknowledgments

- React.js community
- Express.js team
- MySQL developers
- All contributors and testers
