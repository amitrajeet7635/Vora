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

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        showToast(decodeURIComponent(errorParam), 'error');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (successParam === 'true') {
        try {
          await refreshUser();
          showToast('Successfully logged in!', 'success');
          setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err) {
          setError('Failed to fetch user data');
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
