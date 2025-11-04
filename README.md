# Vora - OAuth2 Authentication Platform

A production-grade **MERN stack** application implementing **OAuth2 Authorization Code Flow with PKCE** for Google and Facebook authentication. Built with React, Node.js, Express, MongoDB, and JWT for secure session management.

🌐 **Live Demo:** [vora-auth.vercel.app](https://vora-auth.vercel.app)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/amitrajeet7635/Vora.git
cd Vora

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend setup (in a new terminal)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5001" > .env
npm run dev

# Visit http://localhost:5173
```

---

## 🚀 Features

### Backend
- ✅ **OAuth2 with PKCE** - Secure authorization code flow with Proof Key for Code Exchange
- ✅ **Multi-Provider Support** - Google and Facebook authentication
- ✅ **JWT Sessions** - Secure httpOnly cookie-based authentication
- ✅ **Account Linking** - Link multiple OAuth providers to single account
- ✅ **Role-Based Access Control** - Support for user and admin roles
- ✅ **Session Management** - Track and revoke active sessions
- ✅ **Security Hardened** - Helmet, CORS, rate limiting, CSRF protection
- ✅ **Structured Logging** - Winston logger with correlation IDs
- ✅ **Request Tracking** - Full audit trail of authentication events
- ✅ **MongoDB Integration** - Mongoose ODM with efficient indexing
- ✅ **Production Ready** - Graceful shutdown, error handling, health checks

### Frontend
- ✅ **Modern React** - Built with React 18 + Vite for blazing fast development
- ✅ **Beautiful UI** - Responsive design with Tailwind CSS
- ✅ **Dark/Light Theme** - Theme toggle with persistent preferences
- ✅ **Smooth Animations** - Framer Motion for delightful user experience
- ✅ **OAuth Integration** - Seamless Google & Facebook login buttons
- ✅ **Account Management** - Link/unlink providers, view active sessions
- ✅ **Profile Customization** - Update name, view avatar, manage settings
- ✅ **Toast Notifications** - Real-time feedback for user actions
- ✅ **Fully Responsive** - Mobile-first design for all screen sizes
- ✅ **Error Handling** - Error boundaries and fallback UI
- ✅ **Protected Routes** - Client-side route protection

---

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0
- Google OAuth2 credentials
- Facebook OAuth2 credentials

---

## 🛠️ Installation

### Backend Setup

#### 1. Clone the repository

```bash
git clone https://github.com/amitrajeet7635/Vora.git
cd Vora
```

#### 2. Install backend dependencies

```bash
cd backend
npm install
```

#### 3. Configure backend environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/vora

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/callback/google

# Facebook OAuth2
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5001/api/auth/callback/facebook
```

#### 4. Start MongoDB

Make sure MongoDB is running locally or update `MONGODB_URI` with your connection string.

```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Frontend Setup

#### 1. Install frontend dependencies

```bash
cd ../frontend
npm install
```

#### 2. Configure frontend environment variables

Create `frontend/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:5001
```

---

## 🎯 Usage

### Running the Full Application

#### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5001`

#### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

#### Access the Application

Open your browser and navigate to: `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/google` | Initiate Google OAuth flow | No |
| GET | `/api/auth/facebook` | Initiate Facebook OAuth flow | No |
| GET | `/api/auth/callback/google` | Google OAuth callback | No |
| GET | `/api/auth/callback/facebook` | Facebook OAuth callback | No |
| POST | `/api/auth/logout` | Logout current session | Yes |
| POST | `/api/auth/unlink/:provider` | Unlink OAuth provider | Yes |

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/me` | Get current user profile | Yes |
| PATCH | `/api/user/me` | Update user profile | Yes |
| DELETE | `/api/user/me` | Delete user account | Yes |
| GET | `/api/user/sessions` | Get active sessions | Yes |
| DELETE | `/api/user/sessions/:id` | Revoke specific session | Yes |
| POST | `/api/user/sessions/revoke-all` | Revoke all other sessions | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api` | API version info |

---

## 🔐 OAuth2 Setup

### Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5001/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### Facebook OAuth2

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs: `http://localhost:5001/api/auth/callback/facebook`
5. Copy App ID and App Secret to `.env`

---

## 🏗️ Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── env.js             # Environment configuration
│   ├── controllers/
│   │   ├── auth.controller.js # OAuth flow handlers
│   │   └── user.controller.js # User management
│   ├── middlewares/
│   │   ├── authMiddleware.js  # JWT verification
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── requestLogger.js   # Request logging
│   ├── models/
│   │   └── User.js            # User schema
│   ├── routes/
│   │   ├── auth.routes.js     # Auth endpoints
│   │   └── user.routes.js     # User endpoints
│   ├── services/
│   │   ├── googleOAuth.service.js   # Google OAuth logic
│   │   └── facebookOAuth.service.js # Facebook OAuth logic
│   └── utils/
│       ├── jwt.js             # JWT utilities
│       ├── logger.js          # Winston logger
│       └── oauth.js           # PKCE utilities
├── logs/                      # Application logs
├── app.js                     # Express app setup
├── server.js                  # Server entry point
├── seed.js                    # Database seeding
├── .env.example               # Environment template
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── auth.js            # API client functions
│   ├── assets/
│   │   └── vora-logo.png      # Application logo
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.jsx     # Reusable button component
│   │   │   ├── Loader.jsx     # Loading spinners
│   │   │   └── ThemeToggleButton.jsx  # Theme switcher
│   │   ├── molecules/
│   │   │   └── Toast.jsx      # Toast notifications
│   │   └── organisms/
│   │       ├── ErrorBoundary.jsx  # Error boundary wrapper
│   │       └── Navbar.jsx     # Navigation bar
│   ├── context/
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── ThemeContext.jsx   # Theme state management
│   ├── pages/
│   │   ├── CallbackPage.jsx   # OAuth callback handler
│   │   ├── DashboardPage.jsx  # User dashboard
│   │   ├── LandingPage.jsx    # Home/login page
│   │   └── SettingsPage.jsx   # User settings
│   ├── routes/
│   │   └── ProtectedRoute.jsx # Route protection HOC
│   ├── App.jsx                # App component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.js          # PostCSS config
└── package.json
```

---

## 🔒 Security Features

### Implemented Security Measures

- **PKCE (RFC 7636)** - Proof Key for Code Exchange for OAuth2
- **Helmet** - Security headers (CSP, HSTS, etc.)
- **CORS** - Configured for frontend domain only
- **Rate Limiting** - Prevent brute force attacks
- **httpOnly Cookies** - XSS protection for tokens
- **SameSite Cookies** - CSRF protection
- **Input Validation** - Express-validator for request validation
- **Session Management** - Track and revoke active sessions
- **Correlation IDs** - Request tracking and audit trails
- **Structured Logging** - Security event monitoring

### Environment-Specific Security

**Development:**
- CORS relaxed for localhost
- Detailed error messages
- SameSite=Lax for easier testing

**Production:**
- Strict CORS configuration
- HTTPS-only cookies (secure flag)
- SameSite=Strict
- Minimal error exposure

---

## 📊 Logging

All authentication events are logged with correlation IDs for tracking:

- LOGIN_SUCCESS - Successful authentication
- LOGIN_FAILURE - Failed authentication attempt
- LOGOUT - User logout
- LINK_ACCOUNT - Provider linked to account
- UNLINK_ACCOUNT - Provider unlinked
- SESSION_INVALID - Invalid session detected
- RATE_LIMIT_EXCEEDED - Rate limit violation

Logs are stored in:
- logs/combined.log - All logs
- logs/error.log - Error logs only
- logs/exceptions.log - Uncaught exceptions

---

## 🧪 Testing

### Backend Testing

**Health Check:**
```bash
curl http://localhost:5001/health
```

**Initiate Google Login:**
```bash
curl http://localhost:5001/api/auth/google
```

**Get Current User (with JWT cookie):**
```bash
curl -X GET http://localhost:5001/api/user/me 
  --cookie "vora_token=YOUR_JWT_TOKEN"
```

**Logout:**
```bash
curl -X POST http://localhost:5001/api/auth/logout 
  --cookie "vora_token=YOUR_JWT_TOKEN"
```

### Frontend Testing

#### Development Testing
1. Start both backend and frontend servers
2. Navigate to `http://localhost:5173`
3. Click "Continue with Google" or "Continue with Facebook"
4. Complete OAuth flow
5. Verify dashboard displays user information
6. Test theme toggle
7. Test account linking/unlinking
8. Test logout functionality

#### Production Testing
Visit [vora-auth.vercel.app](https://vora-auth.vercel.app) and test:
- OAuth login flows
- Dashboard features
- Settings page
- Theme persistence
- Mobile responsiveness

---

## 📸 Screenshots

### Landing Page (Light Theme)
Beautiful, clean interface with OAuth buttons and theme toggle.

### Landing Page (Dark Theme)
Elegant dark mode with proper contrast and readability.

### Dashboard
User profile with connected accounts and management options.

### Settings
Customize profile and manage application preferences.

---

## 🐛 Troubleshooting

### Backend Issues

#### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# Or check service status
brew services list | grep mongodb
```

#### Port Already in Use

```bash
# Find process using port 5001
lsof -i :5001

# Kill the process
kill -9 <PID>
```

#### OAuth Redirect URI Mismatch

Make sure the callback URLs in your OAuth provider settings match exactly:
- Google: `http://localhost:5001/api/auth/callback/google`
- Facebook: `http://localhost:5001/api/auth/callback/facebook`

#### Missing Environment Variables

The app will fail to start if required env vars are missing. Check console output for details.

### Frontend Issues

#### API Connection Errors

Ensure backend is running and `VITE_API_URL` in `frontend/.env` points to the correct backend URL.

```env
# Development
VITE_API_URL=http://localhost:5001

# Production
VITE_API_URL=https://your-backend-api.com
```

#### Theme Not Persisting

Clear localStorage and refresh:
```javascript
localStorage.clear();
location.reload();
```

#### Images Not Loading (Profile/Avatar)

This might be due to CORS issues with Google/Facebook CDN. The app includes fallback UI for failed images.

#### Build Errors

```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 Database Schema

### User Model

```javascript
{
  name: String,
  email: String (unique, indexed),
  avatar: String,
  roles: [String],  // ['user', 'admin']
  providers: [{
    name: String,   // 'google' or 'facebook'
    providerId: String,
    linkedAt: Date
  }],
  activeSessions: [{
    sessionId: String,
    createdAt: Date,
    expiresAt: Date,
    userAgent: String,
    ip: String
  }],
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/<appname>
FRONTEND_URL=https://<appname>.app
GOOGLE_CALLBACK_URL=https://api.<appname>.app/api/auth/callback/google
FACEBOOK_CALLBACK_URL=https://api.<appname>.app/api/auth/callback/facebook
```

### Recommended Hosting

- **Backend:** Railway, Render, Heroku, AWS EC2
- **Database:** MongoDB Atlas
- **Logs:** Logtail, Datadog, CloudWatch

---

## 📚 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, OAuth2 (Google, Facebook)
- **Security:** Helmet, CORS, Express Rate Limit
- **Logging:** Winston
- **Validation:** Express-Validator
- **HTTP Client:** Axios

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Animations:** Framer Motion
- **Routing:** React Router 6
- **Icons:** Lucide React
- **HTTP Client:** Fetch API
- **State Management:** React Context API

---

## 🎨 Frontend Features

### Pages

1. **Landing Page** (`/`)
   - Beautiful hero section with logo
   - "Continue with Google" button
   - "Continue with Facebook" button
   - Theme toggle (Dark/Light)
   - Responsive design for all devices

2. **Dashboard** (`/dashboard`)
   - User profile information
   - Connected accounts management
   - Link/unlink OAuth providers
   - Profile avatar display
   - Account security notice

3. **Settings** (`/settings`)
   - Update display name
   - View email address
   - Theme preferences
   - Profile picture preview
   - Security information

4. **Callback Page** (`/callback`)
   - Handles OAuth redirects
   - Loading state
   - Error handling
   - Auto-redirect after success

### Components Architecture

#### Atoms (Basic Building Blocks)
- **Button** - Multi-variant button (Primary, Google, Facebook, Outline, Ghost)
- **Loader** - Page and inline loading spinners
- **ThemeToggleButton** - Switch between light/dark themes

#### Molecules (Composite Components)
- **Toast** - Notification system with success/error states

#### Organisms (Complex Components)
- **Navbar** - Responsive navigation with user menu
- **ErrorBoundary** - Catches React errors gracefully

### Theme System

The application supports both light and dark themes with:
- CSS custom properties for dynamic theming
- Persistent theme preference in localStorage
- Smooth transition animations
- Accessible color contrast ratios

**Color Scheme:**
```css
Light Theme:
- Background: #F3F4F6
- Card: #FFFFFF
- Text: #1F2937
- Accent: #6366F1

Dark Theme:
- Background: #111827
- Card: #1F2937
- Text: #F9FAFB
- Accent: #818CF8
```

### Responsive Design

Mobile-first approach with breakpoints:
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

All pages are fully responsive with:
- Flexible layouts
- Touch-friendly buttons
- Optimized font sizes
- Proper spacing
- Hidden elements on small screens

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

The frontend is deployed on Vercel:
- **Live URL:** [vora-auth.vercel.app](https://vora-auth.vercel.app)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

#### Deploy your own:

```bash
cd frontend
npm install -g vercel
vercel
```

Environment variables for Vercel:
```env
VITE_API_URL=https://your-backend-api.com
```

### Backend Deployment

#### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vora
FRONTEND_URL=https://vora-auth.vercel.app
GOOGLE_CALLBACK_URL=https://your-api.com/api/auth/callback/google
FACEBOOK_CALLBACK_URL=https://your-api.com/api/auth/callback/facebook
```

#### Recommended Hosting

- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Backend:** Railway, Render, Heroku, AWS EC2
- **Database:** MongoDB Atlas

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👤 Author

**Amitrajeet Konch**
- GitHub: [@amitrajeet7635](https://github.com/amitrajeet7635)

**Khushi Kesarwani**
- GitHub: [@kesarwanikhushi](https://github.com/kesarwanikhushi)

---

## 🙏 Acknowledgments

- OAuth2 RFC 6749 - Authorization Framework
- PKCE RFC 7636 - Proof Key for Code Exchange
- Express.js Community
- MongoDB Documentation

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review the logs in `logs/` directory

---

**Built with ❤️ for secure authentication**
