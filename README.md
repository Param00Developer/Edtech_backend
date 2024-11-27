# Edtech_backend 🎓💻

Welcome to the **Edtech_backend**! This backend project powers an ed-tech platform, offering features like user authentication, course management, payment integration, media storage, and server logging. It is designed with scalability, security, and ease of use in mind.

---

## Key Features 🚀

1. **Course Management 📚**:
   - Full CRUD operations to create, update, buy, and sell courses.
   - Comprehensive role-based access control (RBAC) for `Users`, `Instructors`, and `Admins`.

2. **Authentication 🔐**:
   - Google-based OAuth login.
   - JWT-based user authentication for session management.

3. **Payment Integration (Razorpay) 💳**:
   - Integrated **Razorpay** gateway for secure and seamless course purchase transactions.
   - Supports payment initialization and verification.

4. **Media Storage ☁️**:
   - Cloudinary integration for storing and managing course media files.

5. **Server Logging 📝**:
   - Integrated logging feature to track server events and errors.
   - Helps in debugging and monitoring application performance.

6. **Database 💾**:
   - MongoDB with Mongoose for robust and efficient data handling.

7. **Developer-Friendly 👨‍💻**:
   - Preconfigured for development and production environments.
   - `env.example` file provided for easy setup of environment variables.

---

## Prerequisites

Ensure the following are installed before proceeding:

- **Node.js** (v14 or higher)
- **MongoDB**
- **npm** (Node Package Manager)

---

## Setup Instructions

Follow these steps to set up and run the project:

### 1. Clone the Repository
```bash
git clone https://github.com/Param00Developer/Edtech_backend
cd Edtech_backend
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure Environment Variables
- Copy the env.example file and rename it to .env.
- Fill in the required values :
```bash
PORT=
MONGO_URL=
JWT_SECRET=

# Cloudinary credentials
FOLDER=
API_KEY=
API_SECRET=
CLOUD_NAME=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

LOKI_HOST=
EDTECH_LOKI_APP=
RAZORPAY_KEY=
RAZORPAY_SECRET=
```
### 4. Run the Application
- For production :
```bash
npm run start
```
- For Development:
```bash
npm run dev
```
---
## Technologies Used ⚡

- **Backend Framework**: Node.js (Express.js)
- **Database**: MongoDB (Mongoose)
- **Authentication**: Google OAuth, JWT
- **Payment Gateway**: Razorpay
- **Media Storage**: Cloudinary
- **Environment Management**: dotenv
- **Logging**: Custom logging for server events and errors
- **Logging Service**: LokiJS (Optional)
---
## Server Logging 🛠️

The backend includes a powerful logging mechanism to track server events, errors, and critical operations:

- Logs are stored and monitored for better debugging and performance analysis.
- Optional integration with LokiJS for centralized log management.
---
## Contribution Guidelines 🤝

1. Fork the repository and clone it to your local machine.
2. Create a new branch for your feature or bug fix.
3. Commit and push your changes to your branch.
4. Submit a pull request describing your changes.

