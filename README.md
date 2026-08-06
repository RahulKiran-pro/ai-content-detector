# 🔍 Truth Lens AI — Multi-Modal AI Content Detector & Authenticity Scanner

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-61dafb.svg)](https://react.dev/)
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
- **🔐 Secure Authentication & Session Guard**:
  - JWT token authentication, salted password hashing with `bcryptjs`, protected routing guards, and session persistence.

---

## 🏗️ Architecture & Tech Stack

### **Frontend**
- **Framework**: React 18 with Vite
- **UI & Icons**: Lucide React, Custom Glassmorphic CSS Theme
- **State & Routing**: React Context API (`AuthContext`), React Router v7

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs`
- **Security**: Environment variable startup validation, CORS controls, Express Rate Limiter

### **AI Detection Engine**
- **Service**: TruthScan API (dedicated multi-modal endpoints for text, image, audio, video, and PDF detection)

---

## 🔐 Environment Variables & Production Security

TruthLens AI follows strict zero-hardcoded-secret practices. All sensitive configuration keys are loaded exclusively through environment variables.

### Environment Variable Reference

| Variable Name | Required | Scope | Description | Default / Example |
| :--- | :---: | :--- | :--- | :--- |
| `PORT` | Optional | Backend | Server HTTP listening port | `5000` |
| `NODE_ENV` | Optional | Backend | Runtime mode (`development` or `production`) | `production` |
| `MONGODB_URI` | **Required** | Backend | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | **Required** | Backend | Secret key used to sign and verify JWT tokens | `your_super_secret_jwt_key` |
| `SESSION_SECRET` | Optional | Backend | Secret key for express session encryption | `your_session_secret` |
| `TRUTHSCAN_API_KEY` | **Required** | Backend | TruthScan AI API secret authentication key | `your_truthscan_api_key` |
| `TRUTHSCAN_BASE_URL` | Optional | Backend | Base URL endpoint for TruthScan API | `https://api.truthscan.com` |
| `EMAIL_HOST` | Optional | Backend | SMTP server host for Nodemailer | `smtp.gmail.com` |
| `EMAIL_PORT` | Optional | Backend | SMTP port number | `587` |
| `EMAIL_USER` | Optional | Backend | SMTP username/email address | `your_email@gmail.com` |
| `EMAIL_PASS` | Optional | Backend | SMTP app password | `your_app_password` |
| `EMAIL_FROM` | Optional | Backend | Sender email header | `"TruthLens AI" <noreply@truthlens.ai>` |
| `CLIENT_URL` | Optional | Backend | Allowed CORS origin for backend API | `https://your-frontend.vercel.app` |
| `VITE_API_URL` | **Required** | Frontend | Backend API endpoint consumed by Vite client | `https://your-backend.onrender.com` |
| `GOOGLE_CLIENT_ID` | Optional | Both | Google OAuth 2.0 Client ID | `your_google_client_id` |

---

### Deployment Guide

#### 1. GitHub Repository Security
- **Never commit `.env` files**: All `.env` files are explicitly excluded via `.gitignore`.
- Use `.env.example` templates committed to version control with placeholder values only.

#### 2. Vercel (Frontend Deployment)
- Navigate to your project in Vercel: **Project Settings → Environment Variables**.
- Add the following environment variable:
  - `VITE_API_URL` = `https://your-render-backend-url.onrender.com`

#### 3. Render (Backend Deployment)
- Navigate to your service in Render: **Environment → Secret Files / Environment Variables**.
- Configure the required backend variables:
  - `NODE_ENV` = `production`
  - `MONGODB_URI` = `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
  - `JWT_SECRET` = `your_strong_random_jwt_secret_key`
  - `TRUTHSCAN_API_KEY` = `your_live_truthscan_api_key`
  - `CLIENT_URL` = `https://your-vercel-app.vercel.app`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local MongoDB instance or MongoDB Atlas cluster connection string)
- **TruthScan API Key** (Required for live detection services)

---

### Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/RahulKiran-pro/ai-content-detector.git
   cd ai-content-detector
   ```

2. **Copy Environment Templates**:
   ```bash
   cp .env.example server/.env
   cp client/.env.example client/.env
   ```

3. **Fill in Environment Variables**:
   Update `server/.env` with your local or MongoDB Atlas URI, JWT secret, and TruthScan API key.

4. **Install Dependencies & Start Application**:
   ```bash
   npm run start:server   # Runs backend on http://localhost:5000
   npm run start:client   # Runs frontend on http://localhost:3000
   ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
