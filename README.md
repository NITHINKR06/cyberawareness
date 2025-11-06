# WALRUS - Cybersecurity & Digital Safety Platform

![WALRUS Logo](https://via.placeholder.com/200x100/4F46E5/FFFFFF?text=WALRUS)

**WALRUS** is a comprehensive, gamified, multilingual, AI-powered cybersecurity education and protection platform designed to combat digital scams and cybercrime in India. The platform empowers citizens with knowledge, tools, and community support to navigate the digital world safely.

## 🌟 Overview

WALRUS addresses the critical cybersecurity challenges facing India today:
- **60% increase** in cybercrime cases in 2023
- **₹10,319 crores** lost to digital fraud in 2022
- **70% of Indians** have fallen victim to phone/online scams
- **1.39 lakh** cybercrime complaints filed in 2022 alone

Our solution transforms cybersecurity from a technical burden into an engaging, accessible, and community-driven experience.

## 🎯 Core Features

### 1. **AI-Powered Scam Analyzer**
- **Real-time Analysis**: Instant text, URL, email, and phone number analysis
- **Multi-format Support**: Text input, URL checking, image OCR, and file uploads
- **Threat Detection**: Advanced pattern recognition for:
  - Banking/financial scams
  - Phishing attempts
  - Social engineering tactics
  - Malware threats
  - Urgency pressure tactics
- **Confidence Scoring**: Detailed threat assessment with actionable recommendations
- **Anonymous Usage**: Works without registration for immediate protection

### 2. **Gamified Learning System**
- **Interactive Modules**: 5 comprehensive cybersecurity education modules
- **Progressive Difficulty**: Beginner to advanced content
- **Quiz System**: Knowledge assessment with immediate feedback
- **Points & Levels**: Earn points for learning and threat detection
- **Achievements**: Badges and milestones for motivation
- **Streaks**: Daily engagement tracking
- **Leaderboards**: Community competition

### 3. **Community Features**
- **Scam Reporting**: Easy fraud reporting with categorization
- **Discussion Forums**: Community posts and comments
- **Knowledge Sharing**: User-generated content and experiences
- **Moderation**: Admin-managed content quality
- **Topics**: Organized discussion categories

### 4. **Multilingual Support**
- **English**: Primary language
- **Hindi (हिंदी)**: Full translation support
- **Kannada (ಕನ್ನಡ)**: Regional language support
- **Easy Switching**: Language toggle in navigation

### 5. **Admin Panel**
- **User Management**: Comprehensive user administration
- **Content Moderation**: Posts, comments, and reports management
- **Analytics Dashboard**: Platform statistics and insights
- **Scam Database**: Historical scam information management
- **System Configuration**: Platform settings and rules

## 🏗️ Technical Architecture

### Frontend (React + TypeScript)
```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  React Components  │  State Management  │  Routing         │
│  • ScamAnalyzer    │  • AuthContext     │  • React Router  │
│  • Dashboard       │  • ThemeContext    │  • Protected     │
│  • LearningModules │  • Local Storage   │    Routes        │
│  • ReportScam      │                    │                  │
│  • Achievements    │                    │                  │
└─────────────────────────────────────────────────────────────┘
```

### Backend (Node.js + Express)
```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                │
├─────────────────────────────────────────────────────────────┤
│  Express Routes    │  Middleware        │  Services         │
│  • /api/auth       │  • Security        │  • AI Analyzer    │
│  • /api/analyzer   │  • Validation      │  • OCR Service    │
│  • /api/reports    │  • Rate Limiting   │  • PDF Generator  │
│  • /api/community  │  • Admin Auth      │  • Email Service  │
│  • /api/admin      │                    │                  │
└─────────────────────────────────────────────────────────────┘
```

### Database (MongoDB + Firebase)
```
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  MongoDB Collections        │  Firebase Collections        │
│  • Users                    │  • Admin Users               │
│  • ScamReports              │  • Admin Sessions            │
│  • AnalyzerHistory          │  • System Configuration      │
│  • Posts & Comments         │                              │
│  • Topics & Scams           │                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Internationalization**: react-i18next
- **State Management**: React Context API
- **Charts**: Recharts
- **Notifications**: React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Firebase Auth
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **PDF Generation**: jsPDF
- **OCR**: Tesseract.js

### AI & External Services
- **AI Analysis**: Hugging Face Inference API
- **URL Safety**: Google Safe Browsing API (planned)
- **Email Validation**: Custom regex patterns
- **Phone Validation**: Indian phone number patterns

## 📋 Prerequisites

Before setting up the application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Firebase Project** (for admin authentication)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/walrus.git
cd walrus
```

### 2. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately
npm install                    # Frontend dependencies
npm install --prefix server    # Backend dependencies
```

### 3. Environment Configuration

Create `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/walrus_db
MONGODB_DBNAME=walrus_db

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-session-secret-key-change-in-production

# Server
PORT=5000
NODE_ENV=development

# Firebase (for admin panel)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# AI Services (optional)
HUGGINGFACE_API_KEY=your-huggingface-api-key
GOOGLE_SAFE_BROWSING_API_KEY=your-google-api-key
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Update `src/config/firebase.ts` with your Firebase config
5. Set up Firestore security rules (see `firestore.rules`)

### 5. Database Setup

#### MongoDB
```bash
# Start MongoDB (if running locally)
mongod

# The application will create collections automatically
```

#### Firestore
- Create the following collections in Firestore:
  - `users` (for admin users)
  - `systemConfig` (for platform settings)

### 6. Run the Application

#### Development Mode
```bash
# Start both frontend and backend
npm run dev:all

# Or start separately
npm run dev          # Frontend only (http://localhost:5173)
npm run server:dev   # Backend only (http://localhost:5000)
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start backend
npm run server
```

## 🔄 Application Workflow

### User Journey

#### 1. **Anonymous User**
```
Landing Page → Scam Analyzer → Analysis Results → (Optional) Register
```

#### 2. **Registered User**
```
Login → Dashboard → Learning Modules → Achievements → Community → Report Scams
```

#### 3. **Admin User**
```
Admin Login → Admin Panel → User Management → Content Moderation → Analytics
```

### Core Processes

#### Scam Analysis Flow
1. **Input**: User provides text, URL, email, or image
2. **Validation**: Server validates input format and content
3. **AI Analysis**: Multiple AI engines analyze the content
4. **Pattern Matching**: Local regex patterns check for known scam indicators
5. **Scoring**: Threat level and confidence score calculation
6. **Results**: Detailed analysis with recommendations
7. **Storage**: Analysis history saved for future reference

#### Learning Module Flow
1. **Selection**: User chooses a learning module
2. **Content**: Interactive content with examples and explanations
3. **Quiz**: Knowledge assessment with multiple-choice questions
4. **Scoring**: Points awarded based on performance
5. **Progress**: Learning progress tracked and displayed
6. **Achievements**: Badges unlocked for milestones

#### Report Submission Flow
1. **Form**: User fills out scam report form
2. **Validation**: Server validates all required fields
3. **Processing**: Report categorized and stored
4. **PDF Generation**: Official complaint document created
5. **Notification**: User receives confirmation
6. **Moderation**: Admin reviews and processes reports

## 🛡️ Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure user authentication
- **Firebase Auth**: Admin panel authentication
- **Role-based Access**: User, Moderator, Admin, Super Admin roles
- **Session Management**: Secure session handling

### Input Validation & Sanitization
- **Server-side Validation**: All inputs validated on backend
- **XSS Protection**: HTML sanitization using DOMPurify
- **SQL Injection Prevention**: Mongoose ODM protection
- **Rate Limiting**: API endpoint protection

### Data Protection
- **Password Hashing**: bcrypt with salt rounds
- **HTTPS Enforcement**: Secure communication
- **CORS Configuration**: Controlled cross-origin requests
- **Security Headers**: Helmet.js security middleware

## 📊 Admin Panel Features

### Dashboard
- **System Statistics**: User counts, reports, activity metrics
- **Recent Activity**: Latest users, reports, and posts
- **Analytics Charts**: User registration trends, threat analysis
- **Quick Actions**: Common administrative tasks

### User Management
- **User List**: Paginated user listing with search/filter
- **User Details**: Comprehensive user information
- **Role Management**: Assign/remove user roles
- **Ban/Unban**: User account management
- **Bulk Operations**: Mass user operations

### Content Moderation
- **Posts Management**: Community post moderation
- **Comments Management**: Comment approval/rejection
- **Reports Management**: Scam report processing
- **Topics Management**: Discussion category management

### Analytics
- **User Analytics**: Registration trends, activity patterns
- **Threat Analytics**: Scam analysis statistics
- **Content Analytics**: Post and comment metrics
- **Export Functions**: Data export capabilities

## 🌐 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
```

### Heroku Deployment
```bash
# Install Heroku CLI
# Login to Heroku
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

### Manual Server Deployment
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

### Run Tests
```bash
# Run all tests
npm run test:all

# Individual test suites
npm run test:validation        # Input validation tests
npm run test:validation:debug  # Debug validation tests
npm run test:security          # Security tests
```

### Test Coverage
- **Input Validation**: Email, password, username validation
- **Security**: Authentication, authorization, input sanitization
- **API Endpoints**: Request/response validation
- **Database Operations**: CRUD operations testing

## 📱 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update user profile
```

### Analyzer Endpoints
```
POST /api/analyzer/analyze           # Analyze content
GET  /api/analyzer/history           # Get analysis history
GET  /api/analyzer/session/:id       # Get session history
```

### Community Endpoints
```
GET    /api/community/posts          # Get community posts
POST   /api/community/posts          # Create new post
GET    /api/community/comments/:id   # Get post comments
POST   /api/community/comments       # Add comment
```

### Report Endpoints
```
POST /api/reports                    # Submit scam report
GET  /api/reports                    # Get user reports
GET  /api/reports/:id                # Get specific report
```

### Admin Endpoints
```
GET  /api/admin/stats                # Get system statistics
GET  /api/admin/users                # Get users list
PUT  /api/admin/users/:id            # Update user
POST /api/admin/users/:id/ban        # Ban user
```

## 🔧 Configuration

### Validation Rules
Customize validation rules in `server/config/validationRules.js`:
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
Add new languages by:
1. Creating locale file in `src/i18n/locales/`
2. Adding language option in `LanguageSwitcher.tsx`
3. Updating `src/i18n/index.ts`

## 🚨 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

#### Firebase Authentication Issues
- Verify Firebase configuration in `src/config/firebase.ts`
- Check Firestore security rules
- Ensure Firebase project has Authentication enabled

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run typecheck
```

#### Port Already in Use
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

### Code Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

### Contact
- **Email**: support@walrus.app
- **GitHub**: [WALRUS Repository](https://github.com/your-username/walrus)

## 🎉 Acknowledgments

- **React Team**: For the excellent frontend framework
- **Express.js**: For the robust backend framework
- **MongoDB**: For the flexible database solution
- **Firebase**: For authentication and real-time features
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide**: For the beautiful icon library

---

**Built with ❤️ for a safer digital India**

*WALRUS - Empowering citizens with cybersecurity knowledge and protection*