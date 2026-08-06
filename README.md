# 🔍 Truth Lens AI — Multi-Modal AI Content Detector & Authenticity Scanner

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.2-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.1-646cff.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-v4.19-000000.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)

**Truth Lens AI** is a state-of-the-art multi-modal content verification platform designed to detect AI-generated text, images, audio, video, and PDF documents. Powered by backend integration with the **TruthScan API**, Truth Lens AI enables users, journalists, researchers, and content moderators to inspect digital media for deepfakes, synthetic speech, manipulated visuals, and AI-written text with high precision.

---

## ✨ Key Features

- **🌐 Multi-Modal Content Analysis**:
  - **Text & PDF Scanner**: Detects AI-generated content (ChatGPT, Claude, Gemini, Llama) with sentence-level probability highlights, burstiness, and perplexity analysis.
  - **Image Deepfake & Artifact Detection**: Pinpoints AI-generated images (Midjourney, DALL-E, Stable Diffusion) and image manipulation using pixel artifact inspection.
  - **Audio Deepfake & Voice Cloning Scanner**: Identifies synthetic speech, voice clones, and audio manipulations.
  - **Video Manipulation & Frame Inspection**: Detects facial swapping, temporal frame anomalies, and synthetic AI video generators (Sora, Runway, Pika).
- **🛡️ Community Flagged Media Feed**:
  - Community repository of flagged media with upvotes, verification statuses, threat levels, category tags, and user discussions.
- **📊 Detailed Verification Reports**:
  - In-depth modal breakdowns featuring authenticity scores, confidence meters, threat levels, and exportable verification summaries.
- **📜 Analysis History**:
  - Save scan results to your user account, search past audits, filter by media type, and re-examine detailed metrics.
- **🔐 Secure Authentication**:
  - JWT token authentication, salted password hashing with `bcryptjs`, and Google OAuth 2.0 single sign-on support.

---

## 🏗️ Architecture & Tech Stack

### **Frontend**
- **Framework**: React 18 with Vite
- **UI & Icons**: Lucide React, DotLottie React, Custom CSS Glassmorphism Theme
- **State Management**: React Context API (`AuthContext`)

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs`
- **Security & Utilities**: Express Rate Limit, Multer (file handling), Axios, CORS

### **AI Detection Engine**
- **Service**: TruthScan API (dedicated multi-modal endpoints for text, image, audio, video, and PDF detection)

---

## 📂 Project Structure

```
Truth Lens AI/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Core UI Components
│   │   │   ├── AIDetectionPanel.jsx        # Main Detection & Upload Interface
│   │   │   ├── AuthModal.jsx               # Login / Signup Modal
│   │   │   ├── FlaggedMediaViewer.jsx      # Community Flagged Feed
│   │   │   ├── HistoryPage.jsx             # User Scan History & Search
│   │   │   └── VerificationReportModal.jsx # Comprehensive Scan Details
│   │   ├── context/            # React Context (AuthContext)
│   │   ├── App.jsx             # Root Component & Route Management
│   │   └── index.css           # Global Glassmorphic CSS Theme
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API (Node.js + Express)
│   ├── config/                 # Database Configuration (`db.js`)
│   ├── middleware/             # Auth JWT verification & Rate Limiter
│   ├── models/                 # Mongoose Schemas (User, DetectionHistory, FlaggedContent)
│   ├── routes/                 # API Routes (auth, detect, history, flagged)
│   ├── services/               # TruthScan API Service Integration (`truthscanService.js`)
│   ├── .env.example            # Environment variables template
│   └── index.js                # Server entry point
│
├── package.json                # Root workspace configuration & scripts
└── README.md                   # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local MongoDB instance or MongoDB Atlas cluster connection string)
- **TruthScan API Key** (Required for live detection services)

---

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/RahulKiran-pro/ai-content-detector.git
   cd ai-content-detector
   ```

2. **Install Dependencies**:
   Install root, server, and client dependencies using the root helper script:
   ```bash
   npm run install:all
   ```

---

### Environment Setup

Create a `.env` file inside the `server/` directory based on `server/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/truth_lens_db
JWT_SECRET=your_super_secret_jwt_key
TRUTHSCAN_API_KEY=your_truthscan_api_key
GOOGLE_CLIENT_ID=your_google_client_id
```

---

### Running the Application

You can start both the backend server and client frontend using root commands:

- **Start Backend Server**:
  ```bash
  npm run start:server
  ```
  *(Backend runs on `http://localhost:5000`)*

- **Start Frontend Client**:
  ```bash
  npm run start:client
  ```
  *(Frontend dev server runs on `http://localhost:5173`)*

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user & retrieve JWT token |
| `POST` | `/api/auth/google` | Sign in / register via Google OAuth |
| `GET` | `/api/auth/me` | Fetch current authenticated user profile |

### Detection (`/api/detect`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/detect/text` | Analyze raw text or text file for AI generation |
| `POST` | `/api/detect/image` | Upload and scan an image for AI generation or deepfakes |
| `POST` | `/api/detect/audio` | Upload and scan audio for synthetic voice / voice cloning |
| `POST` | `/api/detect/video` | Upload and analyze video for deepfakes & frame anomalies |
| `POST` | `/api/detect/pdf` | Upload and scan PDF documents for AI content |

### History & Audits (`/api/history`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/history` | Get user's scan history (supports type filtering & search) |
| `POST` | `/api/history` | Save a new detection result to history |
| `DELETE` | `/api/history/:id` | Delete a saved scan item |

### Flagged Media (`/api/flagged`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/flagged` | Fetch community flagged media items |
| `POST` | `/api/flagged` | Submit new media to the community flagged feed |
| `POST` | `/api/flagged/:id/vote` | Upvote or downvote a flagged media submission |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/RahulKiran-pro/ai-content-detector/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
