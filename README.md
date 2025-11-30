# 🛡️ WALRUS - Cybersecurity & Digital Safety Platform

> 🔖 **Collaboration Tag**: Open for contributors—follow the guide below to explore the platform’s capabilities without sharing credentials or environment secrets.

<div align="center">

**A comprehensive, gamified, multilingual, AI-powered cybersecurity education and protection platform**

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 What is WALRUS?

**WALRUS** (Web Application for Learning, Reporting, and Understanding Security) is a comprehensive cybersecurity education and protection platform designed specifically to address the growing digital safety challenges in India. 

WALRUS is an all-in-one solution that combines:

- **AI-Powered Protection**: Advanced scam detection system that analyzes text, URLs, emails, and phone numbers in real-time to help users identify potential threats before they become victims
- **Interactive Learning**: Gamified cybersecurity education modules that make learning about digital safety engaging and accessible to everyone, regardless of technical background
- **Community Platform**: A space where users can share experiences, report scams, and learn from each other's encounters with cyber threats
- **Multilingual Support**: Fully localized in English, Hindi, and Kannada to ensure accessibility across diverse Indian communities
- **Time Machine Experience**: Interactive scenarios that teach users about cybersecurity threats across different time periods (2015, 2025, 2035), helping them understand the evolution of digital fraud

The platform transforms complex cybersecurity concepts into an engaging, user-friendly experience that empowers citizens to protect themselves online. Whether you're checking if a suspicious message is a scam, learning about phishing attacks, or reporting a fraudulent website, WALRUS provides the tools and knowledge needed to stay safe in the digital world.

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
- **AI-Powered Scam Analyzer**: Multi-format analysis (text, URL, email, phone) with Hugging Face AI integration, OCR support, and fallback pattern detection
- **Gamified Learning System**: 5 comprehensive cybersecurity education modules with interactive quizzes, achievements, and leaderboards
- **Community Platform**: Discussion forums with posts, comments, topics, and admin moderation tools
- **Scam Reporting System**: Comprehensive reporting with categorization, PDF generation, and status tracking
- **Time Machine**: Interactive scenarios across 3 eras (2015, 2025, 2035) with decision-based storylines
- **Admin Panel**: Complete admin dashboard with user management, content moderation, analytics, and system statistics
- **Multilingual Support**: Full localization in English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ) with 870+ translation keys per language
- **Security Sandbox**: Practice environment for security concepts
- **User Profile & Settings**: Profile management, preferences, and settings customization
- **Theme System**: Dark/Light theme support with persistent preferences
- **Responsive Design**: Mobile-first design optimized for all screen sizes

🚀 **Deployment Ready:**
- **Vercel Serverless**: Configured for serverless deployment with `api/[...path].js` catch-all routing
- **Render Support**: Optimized for Render.com deployment with keep-alive functionality
- **MongoDB Atlas**: Cloud database integration with connection pooling and retry logic
- **Firebase Authentication**: Complete Firebase Auth integration for user authentication (replaces legacy JWT auth)
- **Production Security**: Comprehensive security middleware stack (XSS, CSRF, NoSQL injection, rate limiting, security headers)
- **70+ API Endpoints**: Fully implemented REST API across 9 route modules

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
- **Framework**: React 18.3 + TypeScript 5.5
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Internationalization**: react-i18next with browser language detection
- **Charts**: Recharts 3.2
- **Notifications**: React Toastify
- **Routing**: React Router DOM 7.9
- **Markdown**: react-markdown with remark-gfm
- **Animations**: GSAP 3.13, Rive (for interactive animations)
- **Date Handling**: date-fns 4.1

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose 8.x
- **Authentication**: Firebase Authentication (primary) + Firebase Admin SDK for backend verification
- **Security**: Helmet.js, CORS, express-rate-limit, express-slow-down, custom security middleware
- **File Processing**: Multer (file uploads), Tesseract.js (OCR), Puppeteer (web scraping)
- **PDF Generation**: jsPDF + jspdf-autotable
- **Session Management**: express-session with secure cookie configuration
- **URL Intelligence**: Cloudflare URL Scanner, Google Safe Browsing API (optional), Whois lookup

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

# Firebase (Required for user authentication)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase Admin (Required for backend authentication verification)
# Download service account key from Firebase Console → Project Settings → Service Accounts
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key

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
2. Enable Authentication with Email/Password provider
3. Create a Firestore database (start in production mode or test mode)
4. Copy your Firebase web app config to `.env` (VITE_FIREBASE_* variables)
5. Set up Firebase Admin SDK:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key" to download service account JSON
   - Extract the values and add to `.env`:
     - `FIREBASE_ADMIN_PROJECT_ID`
     - `FIREBASE_ADMIN_CLIENT_EMAIL`
     - `FIREBASE_ADMIN_PRIVATE_KEY` (full key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
6. Set up Firestore security rules (see `firestore.rules` in project root)
7. Configure Firestore indexes if needed for complex queries

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

1. **Anonymous User**: 
   - Use Scam Analyzer for text analysis (no registration required)
   - Browse public community posts
   - View learning modules (limited access)
   - Access Time Machine scenarios

2. **Registered User** (Firebase Authentication):
   - Full access to Scam Analyzer (including URL analysis)
   - Complete learning modules with progress tracking
   - Earn achievements and view leaderboard
   - Create and manage scam reports
   - Participate in community discussions
   - Access Security Sandbox
   - Manage profile and settings

3. **Admin User** (Firebase Admin Authentication):
   - All registered user features
   - Admin dashboard with system statistics
   - User management (view, ban, delete users)
   - Content moderation (posts, comments, topics)
   - Reports management
   - Scam database management
   - Analytics and insights

### Key Workflows

- **Scam Analysis**: Input text/URL/email → Get threat assessment → View recommendations
- **Learning**: Select module → Study content → Take quiz → Earn points
- **Reporting**: Fill report form → Submit → Generate PDF → Track status
- **Time Machine**: Select era → Explore scenarios → Interactive storyline → Learn prevention
- **Security Sandbox**: Practice security concepts in a safe environment

## 📚 API Documentation

### Authentication
**Note**: User authentication is handled by Firebase on the frontend. Backend endpoints use Firebase Admin SDK for token verification.

```
GET  /api/auth/test        # Test endpoint (returns auth status)
POST /api/auth/register    # DEPRECATED - Use Firebase Auth instead
POST /api/auth/login        # DEPRECATED - Use Firebase Auth instead
GET  /api/auth/profile      # Get user profile (requires Firebase token)
PUT  /api/auth/profile      # Update user profile (requires Firebase token)
```

### Analyzer
```
POST /api/analyzer/analyze           # Analyze content (text/URL/email/phone)
                                     # - Text analysis: Public (no auth)
                                     # - URL analysis: Requires authentication
GET  /api/analyzer/history           # Get user's analysis history (requires auth)
GET  /api/analyzer/session/:id     # Get specific session history (requires auth)
GET  /api/analyzer/configuration     # Get analyzer configuration (if configurable mode enabled)
```

### Community
```
GET    /api/community/posts          # Get all community posts (with pagination)
POST   /api/community/posts          # Create new post (requires auth)
GET    /api/community/posts/:id      # Get specific post details
PUT    /api/community/posts/:id      # Update post (requires auth)
DELETE /api/community/posts/:id      # Delete post (requires auth)
GET    /api/community/comments/:id   # Get comments for a post
POST   /api/community/comments       # Add comment (requires auth)
PUT    /api/community/comments/:id   # Update comment (requires auth)
DELETE /api/community/comments/:id   # Delete comment (requires auth)
GET    /api/community/topics         # Get all topics
POST   /api/community/topics         # Create topic (admin only)
```

### Reports
```
POST   /api/reports                  # Submit scam report (requires auth)
GET    /api/reports                  # Get user's reports (requires auth)
GET    /api/reports/:id              # Get specific report details (requires auth)
PUT    /api/reports/:id              # Update report (requires auth)
DELETE /api/reports/:id              # Delete report (requires auth)
GET    /api/reports/export/:id       # Export report as PDF (requires auth)
```

### Scenarios (Time Machine)
```
GET  /api/scenarios                  # Get all scenarios across all eras
GET  /api/scenarios/:era            # Get scenarios by era (2015, 2025, 2035)
GET  /api/scenarios/id/:id          # Get specific scenario details by ID
```

### OCR & File Processing
```
POST /api/ocr/analyze                # Analyze image with OCR (extract text from images)
                                     # Supports: PNG, JPG, JPEG formats
                                     # Returns: Extracted text for further analysis
```

### User Management
```
GET  /api/user/profile              # Get user profile (requires auth)
PUT  /api/user/profile              # Update user profile (requires auth)
GET  /api/user/history              # Get user's complete history (reports + analyzer)
```

### Configuration
```
GET  /api/config/validation-rules    # Get validation rules configuration
GET  /api/config/health             # Health check endpoint
```

### Admin
**All admin endpoints require admin authentication via Firebase Admin SDK**

```
# Dashboard & Statistics
GET  /api/admin/stats                # Get system statistics and analytics
GET  /api/admin/analytics            # Get detailed analytics data

# User Management
GET  /api/admin/users                # Get all users (with pagination/filters)
GET  /api/admin/users/:id            # Get specific user details
PUT  /api/admin/users/:id            # Update user (role, status, etc.)
POST /api/admin/users/:id/ban        # Ban/unban user
DELETE /api/admin/users/:id          # Delete user

# Content Management
GET  /api/admin/posts                # Get all posts (admin view)
PUT  /api/admin/posts/:id            # Moderate/update post
DELETE /api/admin/posts/:id          # Delete post
GET  /api/admin/comments             # Get all comments
PUT  /api/admin/comments/:id         # Moderate comment
DELETE /api/admin/comments/:id        # Delete comment
GET  /api/admin/topics               # Get all topics
POST /api/admin/topics               # Create topic
PUT  /api/admin/topics/:id           # Update topic
DELETE /api/admin/topics/:id          # Delete topic

# Reports Management
GET  /api/admin/reports              # Get all reports
PUT  /api/admin/reports/:id          # Update report status
GET  /api/admin/scams                # Get scam database entries
POST /api/admin/scams                # Add scam to database
PUT  /api/admin/scams/:id            # Update scam entry
DELETE /api/admin/scams/:id           # Delete scam entry
```

## 🚀 Deployment

### Current Deployment Status

The project supports multiple deployment platforms:

**Vercel (Serverless - Recommended):**
- Frontend: Static site deployment (Vite build)
- Backend: Serverless functions via `api/[...path].js` catch-all route
- Database: MongoDB Atlas (cloud)
- Authentication: Firebase Auth
- Auto-scaling and edge network

**Render.com (Traditional Server):**
- Frontend: Static site deployment
- Backend: Web service with Express.js
- Database: MongoDB Atlas (cloud)
- Authentication: Firebase Auth
- Built-in keep-alive functionality to prevent server sleep
- Automatic SSL certificates

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

### Render Deployment

The project includes built-in support for Render.com deployment:

```bash
# The server automatically detects Render environment
# Configure these environment variables in Render dashboard:
# - MONGODB_URI (required)
# - FIREBASE_ADMIN_* (required for auth)
# - HUGGINGFACE_API_KEY (required for AI analysis)
# - JWT_SECRET, SESSION_SECRET (required for security)
```

**Features:**
- Automatic environment detection
- Keep-alive ping functionality (prevents server sleep)
- MongoDB connection retry logic
- Production-ready error handling

See `md/RENDER_DEPLOYMENT.md` for step-by-step Render deployment guide.

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

- **Authentication**: Firebase Authentication (frontend) + Firebase Admin SDK (backend verification)
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
