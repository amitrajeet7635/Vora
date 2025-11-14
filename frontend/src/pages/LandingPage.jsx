// Landing Page - Pixel-perfect replication of the design
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { ThemeToggleButton } from '../components/atoms/ThemeToggleButton';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FacebookLogin from '@greatsumini/react-facebook-login';
import voraLogo from '../assets/vora-logo.png';

// Google Icon SVG - Colorful version for white background
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="google-icon">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Facebook Icon SVG - Colored version for white background
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="facebook-icon">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);

export const LandingPage = () => {
  const { login, loginWithFacebook, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fbLoading, setFbLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    login('google');
  };

  const handleFacebookCallback = async (response) => {
    console.log('Facebook response received:', response);
    
    // Check if user cancelled or error occurred
    if (response?.status === "unknown") {
      console.error('Facebook login cancelled or failed');
      return;
    }

    // Check if we have the required data
    if (!response?.accessToken || !response?.userID) {
      console.error('Invalid Facebook response - missing required data');
      console.log('Facebook response received:', response);
      alert('Facebook login failed. Please try again.');
      return;
    }

    console.log('Facebook login successful, verifying with backend...');
    
    try {
      setFbLoading(true);
      
      // Fetch additional user info from Facebook Graph API if not included
      let userData = { ...response };
      
      // If email or name is missing, fetch from Graph API
      if (!response.email || !response.name) {
        try {
          const graphResponse = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${response.accessToken}`
          );
          const graphData = await graphResponse.json();
          userData = {
            ...userData,
            email: graphData.email || response.email,
            name: graphData.name || response.name,
            picture: graphData.picture || response.picture,
          };
          console.log('Fetched additional user data from Graph API:', graphData);
        } catch (graphError) {
          console.error('Error fetching from Graph API:', graphError);
          // Continue with original response data
        }
      }
      
      await loginWithFacebook(userData);
      console.log('Backend verification successful!');
      // Navigation will happen automatically via useEffect when isAuthenticated changes
    } catch (error) {
      console.error('Facebook login error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Facebook login failed. ';
      if (error.message.includes('fetch')) {
        errorMessage += 'Cannot connect to server. Please make sure the backend is running.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setFbLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Theme Toggle - Top Right Corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggleButton variant="icon" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex justify-center mb-6 sm:mb-8"
          >
            <img 
              src={voraLogo} 
              alt="Vora Logo" 
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </motion.div>

          {/* Hero Section */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2"
            style={{ color: 'var(--color-text)' }}
          >
            Welcome to Vora
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-base sm:text-lg mb-8 sm:mb-12 leading-relaxed px-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Authenticate securely with Google or Facebook — fast, simple, private.
          </motion.p>

          {/* OAuth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4"
          >
            <Button
              variant="google"
              size="lg"
              icon={GoogleIcon}
              onClick={handleGoogleLogin}
              className="w-full"
            >
              Continue with Google
            </Button>

            {/* Facebook Login Component */}
            <FacebookLogin
              appId={import.meta.env.VITE_FACEBOOK_APP_ID || ""}
              onSuccess={handleFacebookCallback}
              onFail={(error) => {
                console.error('Facebook login failed:', error);
                alert('Facebook login failed. Please try again.');
              }}
              fields="name,email,picture"
              scope="public_profile,email"
              render={({ onClick, logout }) => (
                <Button
                  variant="facebook"
                  size="lg"
                  icon={FacebookIcon}
                  onClick={onClick}
                  disabled={fbLoading}
                  className="w-full"
                >
                  {fbLoading ? "Signing in..." : "Continue with Facebook"}
                </Button>
              )}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-4 sm:py-6 px-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <a
            href="#"
            className="transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          >
            Privacy Policy
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://github.com/amitrajeet7635/Vora"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          >
            <Github size={16} />
            GitHub
          </a>
          <span className="hidden sm:inline">•</span>
          <span>© 2025 Vora</span>
        </div>
      </footer>
    </div>
  );
};
