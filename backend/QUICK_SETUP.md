# 🚀 Vora Backend - Quick Setup Guide

This guide will help you get the Vora backend up and running in minutes.

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies
\`\`\`bash
cd backend
npm install
\`\`\`

### Step 2: Configure Environment
Edit the \`.env\` file with your OAuth credentials:
\`\`\`bash
# The .env file is already created. Update these values:
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
FACEBOOK_APP_ID=your-actual-facebook-app-id
FACEBOOK_APP_SECRET=your-actual-facebook-app-secret
\`\`\`

### Step 3: Start the Server
\`\`\`bash
# Make sure MongoDB is running first!
npm run dev
\`\`\`

✅ Server should be running at **http://localhost:5001**

---

## 🔑 Getting OAuth Credentials

### Google OAuth Setup (5 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a Project**
   - Click "Select a project" → "New Project"
   - Name it "Vora" → Create

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Vora Backend"
   - Authorized redirect URIs:
     - \`http://localhost:5001/api/auth/callback/google\`
   - Click "Create"

5. **Copy Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Paste them into your \`.env\` file

### Facebook OAuth Setup (5 minutes)

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/

2. **Create an App**
   - Click "Create App"
   - Choose "Consumer" → Next
   - App name: "Vora"
   - App contact email: your-email@example.com
   - Create app

3. **Add Facebook Login**
   - From dashboard, click "Add Product"
   - Find "Facebook Login" → Set Up

4. **Configure OAuth Settings**
   - Go to Settings → Basic
   - Copy **App ID** and **App Secret**
   - Go to Facebook Login → Settings
   - Valid OAuth Redirect URIs:
     - \`http://localhost:5001/api/auth/callback/facebook\`
   - Save changes

5. **Update .env**
   - Paste App ID and App Secret into \`.env\` file

---

## 💾 MongoDB Setup

### Option 1: Local MongoDB (Recommended for Development)

**macOS (with Homebrew):**
\`\`\`bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongosh
\`\`\`

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Install and run MongoDB as a service

**Linux (Ubuntu/Debian):**
\`\`\`bash
sudo apt-get install mongodb
sudo systemctl start mongodb
\`\`\`

### Option 2: Docker (Easiest)

\`\`\`bash
docker run -d -p 27017:27017 --name vora-mongodb mongo:latest
\`\`\`

### Option 3: MongoDB Atlas (Cloud - Free Tier)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (0.0.0.0/0 for testing)
5. Get connection string
6. Update \`MONGODB_URI\` in \`.env\`:
   \`\`\`
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vora
   \`\`\`

---

## ✅ Verify Installation

### 1. Check Health Endpoint
\`\`\`bash
curl http://localhost:5001/health
\`\`\`

**Expected Response:**
\`\`\`json
{
  "success": true,
  "message": "Vora backend is healthy",
  "timestamp": "2024-11-03T...",
  "environment": "development",
  "uptime": 123.456
}
\`\`\`

### 2. Check API Info
\`\`\`bash
curl http://localhost:5001/api
\`\`\`

### 3. Test OAuth Flow
Open in browser:
\`\`\`
http://localhost:5001/api/auth/google
\`\`\`

You should be redirected to Google's login page.

---

## 🧪 Seed Test Data

Create mock users for testing:
\`\`\`bash
npm run seed
\`\`\`

This creates 4 users:
- john.doe@example.com (Google)
- jane.smith@example.com (Facebook)
- admin@vora.com (Google + Facebook, Admin role)
- test@example.com (Google)

---

## 📡 Test API with Postman

1. **Import Collection**
   - Open Postman
   - Click "Import"
   - Select \`Vora-API.postman_collection.json\`

2. **Test Endpoints**
   - Health Check ✓
   - Get Current User (requires auth)
   - Logout

---

## 🐛 Common Issues & Fixes

### Issue: "Port 5001 already in use"
\`\`\`bash
# Find and kill the process
lsof -i :5001
kill -9 <PID>

# Or change the port in .env
PORT=5001
\`\`\`

### Issue: "MongoDB connection failed"
\`\`\`bash
# Check if MongoDB is running
mongosh

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongodb  # Linux
\`\`\`

### Issue: "Missing required environment variables"
- Check that all required vars are in \`.env\`
- No spaces around \`=\` in .env file
- No quotes needed for values

### Issue: "OAuth redirect URI mismatch"
Make sure callback URLs match exactly:
- Google: \`http://localhost:5001/api/auth/callback/google\`
- Facebook: \`http://localhost:5001/api/auth/callback/facebook\`

---

## 📂 Project Files Created

\`\`\`
✅ Configuration
  - .env (environment variables)
  - .env.example (template)
  - .gitignore

✅ Core Files
  - app.js (Express setup)
  - server.js (entry point)
  - seed.js (database seeding)

✅ Source Code (/src)
  - config/ (db, env)
  - controllers/ (auth, user)
  - middlewares/ (auth, rate limiting, errors)
  - models/ (User schema)
  - routes/ (auth, user)
  - services/ (Google, Facebook OAuth)
  - utils/ (JWT, OAuth PKCE, logger)

✅ Documentation
  - README.md
  - QUICK_SETUP.md (this file)
  - Postman collection
\`\`\`

---

## 🎯 Next Steps

1. **Test OAuth Flow**
   - Try logging in with Google
   - Try logging in with Facebook
   - Check logs in \`logs/combined.log\`

2. **Customize Configuration**
   - Update JWT expiration times
   - Configure CORS for your frontend
   - Adjust rate limiting

3. **Connect Frontend**
   - Point frontend to \`http://localhost:5001/api\`
   - Handle OAuth redirects
   - Store JWT tokens

4. **Deploy**
   - See README.md deployment section
   - Use MongoDB Atlas for database
   - Set up environment variables on hosting platform

---

## 📞 Need Help?

- Check \`logs/\` directory for error messages
- Review README.md for detailed documentation
- Check OAuth provider dashboards for configuration
- Ensure MongoDB is running

---

## 🎉 You're Ready!

Your Vora backend is now configured and ready to handle OAuth2 authentication!

**Test it:**
\`\`\`bash
# Start the server
npm run dev

# In browser, visit:
http://localhost:5001/api/auth/google
\`\`\`

Happy coding! 🚀
