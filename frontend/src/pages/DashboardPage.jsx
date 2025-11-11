// Dashboard Page - User profile and connected accounts
import { motion } from 'framer-motion';
import { User, Mail, Link as LinkIcon, Unlink, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/molecules/Toast';
import { Button } from '../components/atoms/Button';
import { Navbar } from '../components/organisms/Navbar';
import { useState } from 'react';

export const DashboardPage = () => {
  const { user, linkProvider, unlinkProvider, loading } = useAuth();
  const { showToast } = useToast();
  const [unlinking, setUnlinking] = useState(null);

  // Show loading state while user data is being fetched
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent)' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const connectedProviders = user.providers || [];
  const hasGoogle = connectedProviders.some(p => p?.name === 'google');
  const hasFacebook = connectedProviders.some(p => p?.name === 'facebook');

  const handleLinkProvider = async (provider) => {
    try {
      await linkProvider(provider);
    } catch (error) {
      showToast(`Failed to link ${provider}`, 'error');
    }
  };

  const handleUnlinkProvider = async (provider) => {
    if (connectedProviders.length <= 1) {
      showToast('You must have at least one connected account', 'error');
      return;
    }

    setUnlinking(provider);
    try {
      await unlinkProvider(provider);
      showToast(`${provider} account unlinked successfully`, 'success');
    } catch (error) {
      showToast(`Failed to unlink ${provider}`, 'error');
    } finally {
      setUnlinking(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar />
      
      <div className="pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8" style={{ color: 'var(--color-text)' }}>
              Dashboard
            </h1>

            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="rounded-lg shadow-soft p-4 sm:p-6 mb-4 sm:mb-6"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Profile Information
              </h2>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4 sm:gap-6">
                {/* Avatar */}
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto sm:mx-0"
                    style={{ boxShadow: '0 0 0 4px var(--color-accent-light)' }}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto sm:mx-0"
                  style={{ 
                    backgroundColor: 'var(--color-accent)',
                    boxShadow: '0 0 0 4px var(--color-accent-light)',
                    display: user?.avatar ? 'none' : 'flex'
                  }}
                >
                  <User size={24} className="text-white sm:w-8 sm:h-8" />
                </div>

                {/* User Details */}
                <div className="flex-1 text-center sm:text-left w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <User size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    <span className="text-base sm:text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                      {user?.name || 'Unknown User'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Mail size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    <span className="text-sm sm:text-base break-all" style={{ color: 'var(--color-text-secondary)' }}>
                      {user?.email || 'No email'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Connected Accounts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-lg shadow-soft p-4 sm:p-6"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Connected Accounts
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* Google Account */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4285F4' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                        Google
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {hasGoogle ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto">
                    {hasGoogle ? (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Unlink}
                        onClick={() => handleUnlinkProvider('google')}
                        loading={unlinking === 'google'}
                        disabled={connectedProviders.length <= 1}
                        className="w-full sm:w-auto"
                      >
                        Unlink
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Plus}
                        onClick={() => handleLinkProvider('google')}
                        className="w-full sm:w-auto"
                      >
                        Link
                      </Button>
                    )}
                  </div>
                </div>

                {/* Facebook Account */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-facebook)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                        Facebook
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {hasFacebook ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto">
                    {hasFacebook ? (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Unlink}
                        onClick={() => handleUnlinkProvider('facebook')}
                        loading={unlinking === 'facebook'}
                        disabled={connectedProviders.length <= 1}
                        className="w-full sm:w-auto"
                      >
                        Unlink
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Plus}
                        onClick={() => handleLinkProvider('facebook')}
                        className="w-full sm:w-auto"
                      >
                        Link
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {connectedProviders.length <= 1 && (
                <p className="mt-3 sm:mt-4 text-center text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  You must have at least one connected account
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
