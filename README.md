<h1 align="center">Welcome to CommandLink 🔐 </h1>

<p align="center">
   <img src="client/public/icon.svg" alt="CommandLink Logo" width="50%">
</p>

## Table of Contents
1. [Description](#description)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
   - [Client-Side](#client-side)
   - [Server-Side](#server-side)
4. [Registration Process](#registration-process)
5. [Architecture Description](#architecture-description)
   - [Client Side](#client-side-1)
   - [Server Side](#server-side-1)
   - [Database](#database)
6. [Frameworks & APIs](#frameworks--apis)
   - [Database: SQLite](#database-sqlite)
   - [Media Storage: Cloudinary](#media-storage-cloudinary)
   - [Real-Time Communication: Socket.io](#real-time-communication-socketio)
7. [Project Folder Structure](#project-folder-structure)
8. [Installation](#installation)
9. [Demo](#demo)
10. [MFA Demo](#mfa-demo)
11. [Responsive Design Demo](#responsive-design-demo)
12. [License](#license)
13. [Contact](#contact)

---

## Description

CommandLink is a secure administrative command communication platform built for encrypted administrative communication. It supports structured command messaging, orders, circulars, and secure internal governance communication. With end-to-end encryption, your messages remain confidential and secure, ensuring peace of mind in your communications. We don't store any IP addresses, metadata or user-linked data; it is perfectly anonymous.

---


## CommandLink Administrative Extensions

CommandLink now includes:
- Hierarchical roles and permissions (Super Admin, Command Admin, Unit Admin, Officer, Personnel, Observer).
- Official Orders lifecycle with acknowledgements and archival support.
- Circular publication and version tracking.
- Priority signal alerts with acknowledgement toggles.
- Personnel directory search by unit, role, and department.
- Encrypted document distribution with access controls and download tracking.
- Administrative audit logs for non-content actions.

## Features

- **End-to-End Encryption**: Messages are encrypted from sender to receiver, safeguarding your data from prying eyes. Every message stored on the database is encrypted and cannot be read even if the database is breached.
- **Real-Time Messaging**: Fast and seamless chat experience.
- **Cross-Platform Support**: Accessible on multiple devices for convenient communication.
- **NO Metadata Storage**: Prioritizes privacy by storing zero user metadata.
- **Phase 4 Workflow Integration**: Introduces deeper payload validation, realtime order/channel workflow events, and safer operator-facing dashboard controls with clearer error feedback.

---

## Technology Stack

### Client-Side

- React.js: Frontend framework for building the user interface.
- Redux: State management for handling user authentication and messaging.
- TailwindCSS: Utility-first CSS framework for styling the application.
- Axios: HTTP client for API requests.
- Socket.io-client: For real-time messaging between users.

### Server Side

- Node.js: Backend runtime for handling requests.
- Express.js: Lightweight framework for handling API routes and middleware.
- SQLite: local-first database for storing CommandLink entities, commands, and relationships.
- Socket.io: WebSockets for real-time messaging.
- Bcrypt.js: Password hashing for secure authentication.
- Jsonwebtoken (JWT): Token-based authentication for user sessions.
- Cloudinary: Media storage for user profile pictures and message attachments.

---

## Registration Process

Upon user registration, the following occurs:

1. The client **generates a 2048-bit RSA key pair** (public and private key).
2. The client **encrypts the private key** with the user's master password.
3. The client **sends the registration data** (username, public key, and encrypted private key) to the server.
4. The server **stores the information in local SQLite storage**.
5. The server **acknowledges the successful registration** and redirects the client to the login page.

---

## Architecture Description

1. **Client Side**
   - **User Interface (UI)**: Allows users to send/receive messages and manage contacts.
   - **Local Key Management**: Generates and stores private keys encrypted with the master password.
   - **Encryption Module**: Encrypts outgoing messages using the recipient's public key and decrypts incoming messages with the user's private key.

2. **Server Side**
   - **Authentication Module**:
     - Handles user login with the master password.
     - Validates identity and grants access to stored data.
   - **Database Connection**: Stores users' data securely in local SQLite storage.
   - **Message Queue**: Stores encrypted messages so that they are retrieved by the recipient.
   - **Key Exchange Service**: Sends user's public key for ensuring message encryption.

3. **Database**
   - Stores **public keys**.
   - Stores **encrypted messages** (encrypted with recipient’s public key).
   - Stores **encrypted private keys** (encrypted with master passwords).

For more details, refer to the [project architecture documentation](project_architecture.md).

---

## Frameworks & APIs

### **Database: SQLite**

- CommandLink uses a local SQLite database at `data/commandlink.db`.
- The storage layer initializes from `storage/schema.sql` and requires no external database service.

### **Media Storage: Cloudinary**

- To store images and videos, we use **Cloudinary**.
- It provides secure cloud-based storage and delivers media via **HTTPS links**.

### **Real-Time Communication: Socket.io**

- We use **Socket.io** to facilitate **real-time communication** between the client and server.
- This enables **instant message delivery** and **live updates**.

---

## Project Folder Structure

```bash
Encrypted-Chat-App/
│
├── client/                     # Frontend (Client-side) code
│   ├── public/                 # Static files (e.g., index.html, images, icons, manifest)
│   ├── src/                    # React source code
│   │   ├── assets/             # UI assets (logos, backgrounds)
│   │   ├── components/         # UI Components (e.g., ChatBox, MessageList, SearchUser)
│   │   ├── layout/             # Layout-related components
│   │   ├── pages/              # Application pages (Home, Register, ForgotPassword)
│   │   ├── redux/              # Redux store and user management
│   │   ├── routes/             # Route definitions
│   │   ├── services/           # API calls and WebSocket handlers
│   │   ├── utils/              # Helper functions (e.g., encryption handling, file uploads)
│   │   ├── App.js              # Main App entry point
│   │   ├── index.js            # React root rendering logic
│   │   ├── index.css           # Global styles
│   │   └── tailwind.config.js  # Tailwind CSS configuration
│   ├── package.json            # Frontend dependencies and scripts
│   ├── package-lock.json       # Package lock file
│   ├── .env                    # Environment variables
│   ├── .gitignore              # Git ignore rules
│   └── README.md               # Client documentation
│
├── server/                     # Backend (Server-side) code
│   ├── config/                 # Configuration files (e.g., DB connection)
│   ├── controller/             # API route handlers (auth, search, user management)
│   ├── models/                 # Database schemas/models (User, Conversation)
│   ├── routes/                 # API route definitions
│   ├── services/               # Business logic (e.g., conversation retrieval, token management)
│   ├── socket/                 # WebSocket implementation for real-time messaging
│   ├── .env                    # Environment variables
│   ├── .gitignore              # Git ignore rules
│   ├── docker-compose.yml      # Docker setup for backend services
│   ├── index.js                # Main Express server setup
│   ├── package.json            # Backend dependencies and scripts
│   ├── package-lock.json       # Package lock file
│   ├── README.md               # Server documentation
│   └── Dockerfile              # Docker container configuration
│
├── install.sh                  # Installation script for automated setup
├── LICENSE                     # License file
├── project_architecture.md      # Documentation of project architecture
├── README.md                   # Main project README with setup instructions
├── .git/                        # Git repository metadata
├── .gitignore                   # Git ignore rules
├── docker-compose.yml           # Multi-service Docker setup (client, server, database)
└── details/                     # Additional documentation or setup files
```

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/leonfullxr/CommandLink.git
   ```
2. Navigate to the project directory:
   ```bash
   cd CommandLink
   ```
3. Install dependencies and start the server:
   ```bash
   cd server
   npm install
   npm run dev &
   ```
4. Start the client:
   ```bash
   cd ../client
   npm install
   npm start &
   ```
Alternatively, you can use the provided `install.sh` script:
```bash
bash install.sh
```

---



## Local Development Setup (Windows, macOS, Linux)

### Prerequisites
- Node.js 20+
- npm
- SQLite CLI (local persistence)
- Git

### 1) Clone and install dependencies
```bash
git clone https://github.com/leonfullxr/CommandLink.git
cd CommandLink
cd server && npm install
cd ../client && npm install
```

### 2) Initialize local SQLite storage
The server initializes `data/commandlink.db` automatically from `storage/schema.sql` on startup. No external database service is required.

### 3) Configure environment files
Create `server/.env`:
```env
PORT=8080
JWT_SECRET=replace-with-strong-secret
FRONTEND_URL=http://localhost:3000
```

Create `client/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
PORT=3000
```

### 4) Run backend and frontend
Terminal 1:
```bash
cd server
npm run dev
```

Terminal 2:
```bash
cd client
npm start
```

### 5) Run tests and production build checks
```bash
cd server && npm test
cd ../client && npm run build
```

### Windows (PowerShell) quick commands
> If script execution is blocked for npm helper scripts, run PowerShell as Administrator once and set `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

```powershell
git clone https://github.com/leonfullxr/CommandLink.git
cd CommandLink
cd server; npm install
cd ..\client; npm install
cd ..

docker compose up -d db

# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm start
```

### Bootstrap/Recover a super admin
**Bash (macOS/Linux):**
```bash
cd server
SUPERUSER_NAME="Command Superuser" SUPERUSER_EMAIL="superadmin@commandlink.local" SUPERUSER_PASSWORD="change-this-password" SUPERUSER_PUBLIC_KEY="<rsa-public-key>" SUPERUSER_ENCRYPTED_PRIVATE_KEY="<encrypted-private-key>" npm run create:superuser
```

**Default local bootstrap login:**
- Email: `superadmin@commandlink.local`
- Password: `ChangeMeFirst!23`
- Role: `super_admin` (can create and manage other admins)

Run the bootstrap script with defaults:
```bash
cd server
npm run create:superuser
```

Override the defaults when needed:

**PowerShell (Windows):**
```powershell
cd server
$env:SUPERUSER_NAME="Command Superuser"
$env:SUPERUSER_EMAIL="superadmin@commandlink.local"
$env:SUPERUSER_PASSWORD="change-this-password"
$env:SUPERUSER_PUBLIC_KEY="<rsa-public-key>"
$env:SUPERUSER_ENCRYPTED_PRIVATE_KEY="<encrypted-private-key>"
npm run create:superuser
```

---

## Production Rollout Checklist

Use this checklist before each production release:

1. **Pre-deploy validation**
   - Run backend tests: `cd server && npm test`.
   - Build frontend: `cd client && npm run build`.
   - Verify no critical security/config regressions in changed areas.

2. **Environment readiness**
   - Confirm production `.env` values are present and current for client/server services.
   - Verify database connectivity and backup/restore readiness.
   - Verify Cloudinary and OAuth/JWT secrets are valid and rotated per policy.

3. **Deployment strategy**
   - Deploy first to staging and run smoke tests (auth, messaging, admin dashboard, order/channel workflows).
   - Roll out to production via canary (small user slice), monitor logs/metrics, then continue to full rollout.

4. **Post-deploy checks**
   - Confirm websocket messaging flows are healthy (`send`, `recall`, dashboard updates).
   - Confirm admin endpoints and permissions behave as expected.
   - Validate error-rate/latency dashboards and alerting channels are green.

5. **Rollback readiness**
   - Keep previous stable image/build available.
   - If elevated error rates occur, rollback immediately and capture incident notes for follow-up.

---


### Bootstrap a Super Admin Account

To create (or promote) a dedicated `super_admin` account in an existing environment, set these variables and run:

```bash
cd server
SUPERUSER_NAME="Command Superuser" \
SUPERUSER_EMAIL="superadmin@commandlink.local" \
SUPERUSER_PASSWORD="change-this-password" \
SUPERUSER_PUBLIC_KEY="<rsa-public-key>" \
SUPERUSER_ENCRYPTED_PRIVATE_KEY="<encrypted-private-key>" \
npm run create:superuser
```

This script will:
- create a new `super_admin` user when the email does not exist, or
- promote/update the existing user with that email to `super_admin`.

> Note: keep these credentials and key materials out of source control and provide them through a secure secret manager in production.

## Demo

[![Watch the video](https://img.youtube.com/vi/iBy1EfT4Mdk/maxresdefault.jpg)](https://youtu.be/iBy1EfT4Mdk)

---

## MFA Demo

[![Watch the video](https://img.youtube.com/vi/geXBO4Sf9sE/maxresdefault.jpg)](https://youtu.be/geXBO4Sf9sE)

---

## Responsive Design Demo

[![Watch the video](https://img.youtube.com/vi/_2MsXbxJsCE/maxresdefault.jpg)](https://youtu.be/_2MsXbxJsCE)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For inquiries or support, reach out to us at [admin@leonfuller.com](mailto:admin@leonfuller.com).
