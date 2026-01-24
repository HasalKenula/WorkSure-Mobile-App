# ⚡ WorkSure – Skilled Worker Service Platform

**WorkSure** is a **React Native mobile application** developed with **Expo Go**. It allows clients to connect with **verified skilled workers** such as **technicians, electricians, plumbers**, and more.  
The app is part of **Group 15's CSC3113 project** at the University of Ruhuna and works alongside a **Spring Boot backend** with **JWT-based authentication**.

---

## 🚀 Features

### 👤 Client Features
- **Register and log in securely** using JWT authentication
- Browse and **search skilled workers** by:
  - Skill type
  - Rating
  - Location
- Post and manage **service requests**  
- Track **job status** (pending, in progress, completed)
- Make **secure payments** through the platform
- Rate and review workers
- View personal **job history and payment details**
- Fully **mobile-responsive design**

---

### 🛠️ Worker Features
- Register and create a **professional profile**
- Accept or reject **job requests**
- Update **service status**
- View **job history** and **payment status**

**Note:** Admin panel features are not included in this mobile app version.

---

## 🔐 Authentication & Authorization
- **JWT (JSON Web Token)** based authentication
- Role-based authorization for **Clients** and **Workers**
- Protected routes for sensitive operations
- Secure session handling

---

## 🧑‍💻 Tech Stack

### Frontend
- **React Native**
- **Expo Go**
- React Native Stylesheets for styling
- Responsive mobile UI

### Backend
- **Spring Boot**
- RESTful APIs
- JWT Authentication

### Database
- **MySQL**

### API Communication
- **Axios**

---

## 📂 Core Functional Modules
- User Authentication & Authorization  
- Worker Profile Management  
- Service Request Posting & Management  
- Job Tracking & Status Updates  
- Payment Integration & Management  
- Rating & Review System  

---

## 🌐 Application Highlights
- **Secure and reliable** platform connecting clients with verified skilled workers  
- **Real-time job tracking**  
- **Role-based access control** for clients and workers  
- **Mobile-first design** for convenience on smartphones  
- Integrated with a **Spring Boot backend**  

---

## 📦 Installation & Setup

```bash
# Clone frontend repository
git clone https://github.com/HasalKenula/WorkSure-Mobile-App.git
cd WorkSure-Mobile-App
# Install dependencies
npm install
# Start Expo development server
expo start

# Clone backend repository
git clone https://github.com/HasalKenula/WorkSure-backend.git
cd WorkSure-backend
# Open in IntelliJ IDEA / Eclipse
# Configure MySQL database credentials
# Run Spring Boot application

```
---