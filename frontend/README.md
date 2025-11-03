# Vora Frontend

A modern, fully responsive authentication frontend built with React, Vite, Tailwind CSS, and Framer Motion.

## 🎨 Features

- ✅ **Pixel-perfect UI** matching the provided design
- ✅ **Light & Dark Mode** with OS-level preference detection
- ✅ **OAuth Authentication** (Google & Facebook)
- ✅ **Smooth Animations** using Framer Motion
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Protected Routes** with authentication guards
- ✅ **Toast Notifications** for user feedback
- ✅ **Error Boundaries** for graceful error handling
- ✅ **Secure Session Management** using httpOnly cookies

## 🛠️ Tech Stack

- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS with custom theme
- **Routing:** React Router DOM v6
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State Management:** React Context API

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend API URL:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎨 Theme Configuration

The app supports both light and dark modes with localStorage persistence and OS-level preference detection.

## 🔐 Authentication Flow

1. User clicks OAuth button → Redirects to backend
2. After authentication → Redirects to `/callback`
3. Callback validates session → Redirects to dashboard

## 🚢 Deployment

Deploy to Vercel or Netlify. Set `VITE_API_URL` environment variable.

## 📄 License

Part of the Vora capstone project.

