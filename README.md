# 🍽️ SB Foods – Food Ordering App

SB Foods is a responsive, full-stack food ordering platform developed using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**. The application provides tailored interfaces for **Customers**, **Administrators**, and **Restaurant Partners**, streamlining the process of food discovery, order management, and business administration.

## 📌 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
<!-- - [Screenshots](#screenshots) -->
- [Advantages & Limitations](#advantages--limitations)
- [Future Scope](#future-scope)
- [Contributors](#contributors)

## 🧾 Overview
**SB Foods** is an intuitive food ordering system crafted for:
- **Customers** who want fast and filtered food ordering experiences.
- **Administrators** who manage users, orders, restaurants, and promotions.
- **Restaurant Partners** who handle real-time menu management and order processing.

This system empowers all stakeholders with modern web technologies, ensuring seamless usability and control across all fronts.

## ✨ Features

### 👨‍🍳 Customer Interface
- Search bar with auto-suggestions
- Category-based food filtering (Indian, Italian, Desserts, etc.)
- Dynamic cart & secure checkout
- Order summary & confirmation tracking

### 🛠️ Administrator Interface
- Manage restaurants, users, and orders
- Centralized dashboard with visual analytics
- Promotions and discount handling

### 🍔 Restaurant Partner Interface
- Menu and profile updates in real-time
- Order tracking and management
- Edit contact info, hours, and gallery

## 🧰 Tech Stack

| Layer        | Technology                                 |
|--------------|--------------------------------------------|
| Frontend     | React.js, HTML5, CSS3, JavaScript          |
| Backend      | Node.js, Express.js                        |
| Database     | MongoDB with Mongoose                      |
| Versioning   | Git & GitHub                               |
| Hosting      | Compatible with Heroku, Vercel, or Render  |
| Security     | JWT for authentication, HTTPS (SSL/TLS)    |

<!-- ## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/sb-foods.git
cd sb-foods
```

### 2. Install backend dependencies
```bash
cd server
npm install
```

### 3. Install frontend dependencies
```bash
cd ../client
npm install
```

### 4. Set up environment variables
Create a `.env` file in the `server` directory:
```
PORT=5000
MONGO_URI=your_mongo_db_uri
JWT_SECRET=your_jwt_secret
```

### 5. Run the application
```bash
# In /server
npm run dev

# In /client (in separate terminal)
npm start
``` -->

## 📁 Project Structure

```
/client        # React frontend
/server        # Express backend API
/models        # Mongoose data schemas
/routes        # Backend routing
/controllers   # Request handling logic
/utils         # Middleware, validators, etc.
.env           # Environment configuration
```

<!-- ## 🖼️ Screenshots
<Add image links or embedded images of the homepage, admin dashboard, menu editor, etc.> -->

## ✅ Advantages & ❌ Limitations

### ✅ Advantages
- Role-based access control (RBAC)
- Modular and scalable architecture
- Centralized admin control
- Dynamic menu and order management
- Responsive UI for all devices

### ❌ Limitations
- No real payment gateway integration yet
- No live GPS-based order tracking
- Lacks AI-driven personalization
- Basic security (no MFA, API tokens)
- Time-intensive setup for new regions

## 🔭 Future Scope

- 💸 **Razorpay/Stripe Integration**
- 📍 **Live Delivery Tracking via Maps APIs**
- 🤖 **ML-Based Smart Recommendations**
- 🌐 **Multi-Language Support**
- 📱 **Mobile App (Flutter/React Native)**
- 📊 **Advanced Admin Analytics Dashboard**
- ⭐ **Customer Ratings & Review System**
- 🔔 **Automated SMS/Email Notifications**

## 👨‍💻 Contributors
- **Ramaditya Chaudhary** – Frontend and Database Developer  
- **Mayank Yadav** – UI/UX Designer  
- **Ketak Singh** – Backend Developer