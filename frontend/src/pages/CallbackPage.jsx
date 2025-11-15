// Auth Callback Page - Handles OAuth redirects
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLoader } from '../components/atoms/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/molecules/Toast';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState(null);
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple executions
      if (hasHandledCallback.current) return;
      hasHandledCallback.current = true;
      const errorParam = searchParams.get('error');
      const successParam = searchParams.get('success');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        showToast(decodeURIComponent(errorParam), 'error');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (successParam === 'true') {
        try {
          // Store tokens from URL (fallback for browsers that block third-party cookies)
          if (accessToken) {
            localStorage.setItem('vora_access_token', decodeURIComponent(accessToken));
            console.log('✅ Stored access token from URL');
          }
          if (refreshToken) {
            localStorage.setItem('vora_refresh_token', decodeURIComponent(refreshToken));
            console.log('✅ Stored refresh token from URL');
          }
          
          // Add a small delay to ensure cookies are set after OAuth redirect
          // This helps prevent race conditions where cookies haven't propagated yet
          await new Promise(resolve => setTimeout(resolve, 200));
          
          await refreshUser();
          showToast('Successfully logged in!', 'success');
          setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err) {
          console.error('OAuth callback error:', err);
          const errorMessage = err.message === 'Not authenticated' 
            ? 'Authentication failed. Cookies may not be set properly.' 
            : 'Failed to fetch user data';
          setError(errorMessage);
          showToast('Login failed. Please try again.', 'error');
          setTimeout(() => navigate('/'), 3000);
        }
      } else {
        setError('Invalid callback');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-lg shadow-soft p-6 sm:p-8 text-center"
          style={{ backgroundColor: 'var(--color-card)' }}
        >
          <AlertCircle className="mx-auto mb-4 text-red-500" size={40} />
          <h2 className="text-xl sm:text-2xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Authentication Failed
          </h2>
          <p className="mb-4 text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
            {error}
          </p>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Redirecting to home page...
          </p>
        </motion.div>
      </div>
    );
  }

  return <PageLoader />;
};
