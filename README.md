# 🛡️ WALRUS - Cybersecurity & Digital Safety Platform

> 🔖 **Collaboration Tag**: Open for contributors—follow the guide below to explore the platform’s capabilities without sharing credentials or environment secrets.

<div align="center">

**A comprehensive, gamified, multilingual, AI-powered cybersecurity education and protection platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Collaboration Guide](#-collaboration-guide)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Security Features](#️-security-features)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Overview

WALRUS addresses critical cybersecurity challenges in India:

- **60% increase** in cybercrime cases in 2023
- **₹10,319 crores** lost to digital fraud in 2022
- **70% of Indians** have fallen victim to phone/online scams
- **1.39 lakh** cybercrime complaints filed in 2022

Our platform transforms cybersecurity from a technical burden into an engaging, accessible, and community-driven experience.

## 🤝 Collaboration Guide

- **Who can join**: Educators, security researchers, designers, and full-stack engineers who want to improve citizen-focused cybersecurity tooling.
- **Safe setup**: Clone the repo, install dependencies, and create your own `.env` from the template—never commit real API keys or secrets.
- **What to explore**:
  - `src/` for the React/Vite frontend, including Time Machine, learning modules, and localization assets.
  - `server/` for Express services such as scam analysis, reporting, and admin tooling.
  - `api/` for Vercel-ready serverless endpoints that mirror backend routes.
- **How to contribute**:
  1. Pick an issue (or open one) describing the enhancement or fix.
  2. Use the provided scripts (`npm run dev:all`, `npm run test:all`) to validate changes locally.
  3. Add or update documentation/tests relevant to the feature you touch.
  4. Submit a PR summarizing user impact while omitting any sensitive config.
- **Feature tour for collaborators**:
  - *Scam Analyzer*: Exercise text, URL, and file analysis flows to validate AI and fallback heuristics.
  - *Gamified Learning*: Review module progression, streak logic, and quiz feedback loops.
  - *Community & Reporting*: Test post creation, moderation cues, and PDF export from user reports.
  - *Admin & Analytics*: Verify role-based access, dashboard metrics, and user lifecycle operations.
  - *Localization*: Ensure translations remain consistent when adding UI or copy updates.
- **Security expectations**: Keep sample data generic, run lint/tests before PRs, and flag any potential vulnerabilities in issues labeled `security`.

### Current Status

✅ **Fully Functional Features:**
- AI-powered scam analyzer with multi-format support
- Gamified learning modules with quizzes and achievements
- Community forums and discussion boards
- Scam reporting system with PDF generation
- Time Machine interactive scenarios (3 eras: 2015, 2025, 2035)
- Admin panel with user management and analytics
- Comprehensive multilingual support (English, Hindi, Kannada) with 32KB+ translations each
- Security sandbox for practice
- Dark/Light theme support
- Responsive design for mobile and desktop

🚀 **Deployment Ready:**
- Configured for Vercel serverless deployment
- MongoDB Atlas integration
- Firebase authentication
- Production-ready security middleware

## ✨ Features

### 🔍 AI-Powered Scam Analyzer
- Real-time analysis of text, URLs, emails, and phone numbers
- Multi-format support: text input, URL checking, image OCR, file uploads
- Advanced threat detection with confidence scoring
- Anonymous usage without registration

### 🎮 Gamified Learning System
- 5 comprehensive cybersecurity education modules
- Progressive difficulty from beginner to advanced
- Interactive quizzes with immediate feedback
- Points, levels, achievements, and leaderboards
- Daily engagement streaks

### 👥 Community Features
- Scam reporting with categorization
- Discussion forums and knowledge sharing
- User-generated content and experiences
- Admin-managed content moderation

### 🌐 Multilingual Support
- **English** (Primary) - Complete translation with 32KB+ content
- **Hindi (हिंदी)** - Comprehensive translation with 32KB+ content
- **Kannada (ಕನ್ನಡ)** - Full regional support with 36KB+ content
- Enhanced language switcher with improved UI/UX
- Persistent language preference across sessions
- Real-time language switching without page reload
- Culturally appropriate translations for Indian context

### ⚙️ Admin Panel
- User management and role assignment
- Content moderation tools
- Analytics dashboard with insights
- Scam database management

### ⏰ Time Machine - Interactive Scenarios
- Explore cybersecurity threats across different eras (2015, 2025, 2035)
- Interactive storylines with decision-based learning
- Scenario analysis with timelines, prevention measures, and case studies
- Immersive UI with time-travel animations
- Learn from classic scams, modern threats, and future frauds

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Internationalization**: react-i18next
- **Charts**: Recharts
- **Notifications**: React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Firebase Auth
- **Security**: Helmet, CORS, Rate Limiting
- **File Processing**: Multer, Tesseract.js (OCR)
- **PDF Generation**: jsPDF

### AI & Services
- **Primary AI Analysis**: Hugging Face API with customizable models
  - Text Analysis: facebook/bart-large-mnli (default)
  - URL Analysis: facebook/bart-large-mnli (default)
  - Summary Generation: facebook/bart-large-cnn (default)
- **Fallback Analysis**: Pattern-based detection when AI is unavailable
- **Threat Scoring**: Detailed threat score (0-10) with comprehensive reasoning
- **Validation**: Custom regex patterns optimized for Indian context
- **Optional Enhancements**:
  - Google Safe Browsing API for URL threat intelligence
  - Gemini API for advanced summary generation
- **OCR Processing**: Tesseract.js for image text extraction

## 📁 Project Structure

```
project/
├── src/                    # Frontend React application
│   ├── admin/              # Admin panel components
│   ├── components/         # Reusable UI components
│   │   ├── timeMachine/   # Time Machine feature components
│   │   └── ...
│   ├── contexts/           # React contexts (Auth, Theme)
│   ├── i18n/              # Internationalization files
│   ├── pages/             # Page components
│   ├── routes/            # React Router configuration
│   ├── services/          # API service layer
│   └── utils/             # Utility functions
├── server/                 # Backend Express application
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── models/           # MongoDB Mongoose models
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   └── test/             # Backend tests
├── api/                   # Vercel serverless functions
├── public/                # Static assets
├── dist/                  # Production build output
├── md/                    # Additional documentation
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies and scripts
```

## 📦 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Firebase Project** (for admin authentication)
- **Python 3** (optional, for using the server starter script)
- **Hugging Face API Key** (for AI-powered scam analysis)

### Step 1: Clone the Repository

```bash
git clone https://github.com/NITHINKR06/cyberawareness.git
cd cyberawareness
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately
npm install                    # Frontend dependencies
```

### Step 3: Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/walrus_db
MONGODB_DBNAME=walrus_db

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret-key

# Server
PORT=5000
NODE_ENV=development

# Firebase (for admin panel)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# AI Analysis (Required for scam detection)
# Get from: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Optional: Customize AI models (defaults provided if not set)
HUGGINGFACE_TEXT_MODEL=facebook/bart-large-mnli
HUGGINGFACE_URL_MODEL=facebook/bart-large-mnli
HUGGINGFACE_SUMMARY_MODEL=facebook/bart-large-cnn

# Optional: Additional AI enhancements
GOOGLE_SAFE_BROWSING_API_KEY=your-google-safe-browsing-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### Step 4: Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Copy your Firebase config to `.env`
5. Set up Firestore security rules

### Step 5: Run the Application

#### Development Mode

```bash
# Start both frontend and backend
npm run dev:all

# Or start separately
npm run dev          # Frontend (http://localhost:5173)
npm run server:dev   # Backend (http://localhost:5000)
```

#### Production Mode

```bash
# Build frontend
npm run build

# Start backend
npm run server
```

#### Using Python Server Starter (Recommended)

For convenience, use the included Python script to manage both servers:

```bash
# Start both frontend and backend
python start_server.py

# Start only frontend
python start_server.py start frontend

# Start only backend
python start_server.py start backend

# Check server status
python start_server.py status

# Stop a server
python start_server.py stop frontend
python start_server.py stop backend

# Show help
python start_server.py help
```

**Features:**
- Automatic port conflict detection (Frontend: 5173, Backend: 5000)
- Concurrent server management with unified output
- Graceful shutdown with Ctrl+C
- Cross-platform support (Windows, Linux, macOS)
- Process monitoring and automatic cleanup

## ⚙️ Configuration

### Validation Rules
Customize validation in `server/config/validationRules.js`:
- Email validation patterns
- Password strength requirements
- Username constraints
- Content length limits

### AI Analyzer Configuration
Configure analysis parameters in `server/services/aiAnalyzerConfigurable.js`:
- Threat level thresholds
- Confidence score weights
- Pattern matching rules
- Response templates

### Localization

The platform features comprehensive multilingual support with:
- **3 fully translated languages**: English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ)
- **32KB+ translation content** per language covering all UI elements, modules, and features
- **Persistent language preference** stored in localStorage
- **Real-time switching** without page reload using react-i18next
- **Culturally appropriate** translations tailored for Indian context

#### Current Language Files:
- `src/i18n/locales/en.json` - English (32KB+)
- `src/i18n/locales/hi.json` - Hindi (32KB+)
- `src/i18n/locales/kn.json` - Kannada (36KB+)

#### Adding New Languages:
1. Create a new locale file in `src/i18n/locales/` (e.g., `ta.json` for Tamil)
2. Copy the structure from `en.json` and translate all keys
3. Update `src/i18n/index.ts` to import and register the new language:
   ```typescript
   import ta from './locales/ta.json';
   
   i18n.addResourceBundle('ta', 'translation', ta);
   ```
4. Add the language option in `src/components/LanguageSwitcher.tsx`:
   ```typescript
   { code: 'ta', name: 'தமிழ்', nativeName: 'Tamil' }
   ```
5. Test all pages and features with the new language

## 📖 Usage

### User Journey

1. **Anonymous User**: Use Scam Analyzer without registration
2. **Registered User**: Access learning modules, achievements, and community
3. **Admin User**: Manage users, moderate content, view analytics

### Key Workflows

- **Scam Analysis**: Input text/URL/email → Get threat assessment → View recommendations
- **Learning**: Select module → Study content → Take quiz → Earn points
- **Reporting**: Fill report form → Submit → Generate PDF → Track status
- **Time Machine**: Select era → Explore scenarios → Interactive storyline → Learn prevention
- **Security Sandbox**: Practice security concepts in a safe environment

## 📚 API Documentation

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update user profile
```

### Analyzer
```
POST /api/analyzer/analyze           # Analyze content
GET  /api/analyzer/history           # Get analysis history
GET  /api/analyzer/session/:id       # Get session history
```

### Community
```
GET    /api/community/posts          # Get community posts
POST   /api/community/posts          # Create new post
GET    /api/community/comments/:id   # Get post comments
POST   /api/community/comments       # Add comment
```

### Reports
```
POST /api/reports                    # Submit scam report
GET  /api/reports                    # Get user reports
GET  /api/reports/:id                # Get specific report
```

### Scenarios (Time Machine)
```
GET  /api/scenarios                  # Get all scenarios
GET  /api/scenarios/:era            # Get scenarios by era (2015, 2025, 2035)
GET  /api/scenarios/:id             # Get specific scenario details
```

### OCR
```
POST /api/ocr/analyze                # Analyze image with OCR
```

### Admin
```
GET  /api/admin/stats                # Get system statistics
GET  /api/admin/users                # Get users list
PUT  /api/admin/users/:id            # Update user
POST /api/admin/users/:id/ban        # Ban user
```

## 🚀 Deployment

### Current Deployment Status

The project is configured for **Vercel serverless deployment** with:
- Frontend: Static site deployment (Vite build)
- Backend: Serverless functions via `api/[...path].js`
- Database: MongoDB Atlas (cloud)
- Authentication: Firebase Auth

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production deployment
vercel --prod

# Configure environment variables in Vercel dashboard
```

**Configuration**: The project includes `vercel.json` with:
- Serverless function routing for API endpoints
- Frontend rewrites for SPA routing
- CORS headers configuration
- 30-second function timeout

See `md/DEPLOYMENT_README.md` for detailed deployment instructions for multiple platforms.

### Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set SESSION_SECRET=your-session-secret

# Deploy
git push heroku main
```

### Manual Server

```bash
# Build the application
npm run build

# Install PM2 for process management
npm install -g pm2

# Start the application
pm2 start server/server.js --name walrus

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Individual test suites
npm run test:validation        # Input validation tests
npm run test:validation:debug  # Debug validation tests
npm run test:security          # Security tests
npm run test:quick             # Quick security test
npm run test:server            # Server security test
npm run test:manual            # Manual testing guide
```

### Test Coverage
- Input validation and sanitization
- Security middleware (XSS, CSRF, NoSQL injection)
- API endpoint security
- Authentication and authorization

## 🛡️ Security Features

- **Authentication**: JWT tokens + Firebase Auth
- **Authorization**: Role-based access control
- **Input Validation**: Server-side validation and sanitization
- **XSS Protection**: HTML sanitization using DOMPurify (isomorphic-dompurify)
- **CSRF Protection**: Enhanced CSRF token middleware
- **NoSQL Injection Prevention**: Custom middleware for MongoDB query sanitization
- **Rate Limiting**: API endpoint protection with express-rate-limit
- **Security Headers**: Helmet.js middleware with CSP
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Express-session with secure configuration

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Firebase Authentication Issues
- Verify Firebase configuration in `src/config/firebase.ts`
- Check Firestore security rules
- Ensure Firebase project has Authentication enabled

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run typecheck
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## � Additional Documentation

For more detailed information on specific topics, see the documentation in the `md/` directory:

- **[DEPLOYMENT_README.md](md/DEPLOYMENT_README.md)** - Comprehensive deployment guide for multiple platforms (Vercel, Heroku, Render, AWS, etc.)
- **[RENDER_DEPLOYMENT.md](md/RENDER_DEPLOYMENT.md)** - Step-by-step guide for deploying to Render
- **[LOCALAZY_SETUP.md](md/LOCALAZY_SETUP.md)** - Guide for setting up Localazy for translation management

## �📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create [GitHub Issues](https://github.com/NITHINKR06/cyberawareness/issues) for bugs or feature requests
- **Discussions**: Use [GitHub Discussions](https://github.com/NITHINKR06/cyberawareness/discussions) for questions

## 🙏 Acknowledgments

- React Team for the excellent frontend framework
- Express.js for the robust backend framework
- MongoDB for the flexible database solution
- Firebase for authentication and real-time features
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icon library

---

<div align="center">

**Built with ❤️ for a safer digital India**

*WALRUS - Empowering citizens with cybersecurity knowledge and protection*

[⬆ Back to Top](#-walrus---cybersecurity--digital-safety-platform)

</div>
