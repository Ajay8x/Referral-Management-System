# Shree RBSK Referral Management System

Full-stack referral management application built with **Node.js, Express, EJS Template Engine, and MongoDB**.

---

## 📁 Project Architecture & Folder Structure

```text
refermanagement-main/
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   ├── authController.js     # User registration, login, logout, me
│   ├── referralController.js # CRUD, status updates, search & filters
│   └── uploadController.js   # File upload handling
├── middleware/
│   ├── auth.js               # Cookie & JWT auth protection (protectView, protect)
│   └── upload.js             # Multer upload middleware (childPhoto, documents)
├── models/
│   ├── User.js               # User Schema (mobile, password hashing, roles)
│   └── Referral.js           # Referral Schema (child info, defects, status, files)
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── referralRoutes.js     # /api/referrals routes
│   ├── uploadRoutes.js       # /api/upload routes
│   └── viewRoutes.js         # EJS Page rendering routes (/, /login, /register, /dashboard, /logout)
├── views/
│   ├── partials/
│   │   ├── head.ejs          # Meta tags, fonts, CSS stylesheets
│   │   ├── navbar.ejs        # Responsive navigation bar with user profile & logout
│   │   ├── footer.ejs        # Footer info & branding
│   │   ├── newReferralModal.ejs   # Modal to add new child referrals
│   │   ├── statusModal.ejs        # Modal to update referral status
│   │   └── viewDetailsModal.ejs   # Modal to view complete referral details
│   ├── login.ejs             # Mobile-first Login page
│   ├── register.ejs          # Registration page with validation
│   ├── dashboard.ejs         # Dashboard with stat cards, search, filters & cards
│   └── error.ejs             # 404 and error display
├── public/
│   ├── css/
│   │   └── style.css         # Modern, glassmorphic responsive design
│   └── js/
│       ├── auth.js           # Client-side authentication logic
│       └── dashboard.js      # Filter triggers, modal handlers, AJAX updates
├── uploads/                  # Local storage for uploaded files
├── .env                      # Environment configuration (MONGO_URI, JWT_SECRET, PORT)
├── package.json              # Express, EJS, Mongoose, Cookie-Parser, Multer, etc.
├── app.js                    # Express app configuration & middlewares
└── server.js                 # HTTP server entry point (Port 5000)
```

---

## 🚀 How to Run

### 1. Install Dependencies (If not already installed)
```bash
npm install
```

### 2. Start the Application
```bash
npm run dev
```
> Or production mode: `npm start`

### 3. Open in Browser
Visit: **`http://localhost:5000`**

---

## 🔑 Features

- **🔐 Mobile + Password Authentication**: Secure registration and login using 10-digit mobile number, bcrypt hashing, and HTTP-only JWT cookies.
- **📊 Real-time Dashboard**: Dynamic stats for *Total*, *Pending*, *Referred*, *Treatment Started*, and *Completed* referrals.
- **🔍 Search & Filter**: Search across child name, village, father name, hospital, defect, and filter by institute type (School / AWC) and treatment status.
- **📝 Child Referral Management**: Comprehensive modal with conditional School/Anganwadi fields, defect tags (4Ds), contact details, and file uploads.
- **🏥 Status & Treatment Tracking**: Track hospital referral (DEIC / Private Hospital), estimated expenditure, and status history dates.
- **📱 Responsive UI**: Designed with modern CSS, glassmorphism touches, and responsive grid layouts for desktop and mobile devices.