// Dashboard Page - User profile and connected accounts
import { motion } from 'framer-motion';
import { User, Mail, Link as LinkIcon, Unlink, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/molecules/Toast';
import { Button } from '../components/atoms/Button';
import { Navbar } from '../components/organisms/Navbar';
import { useState } from 'react';

export const DashboardPage = () => {
  const { user, linkProvider, unlinkProvider } = useAuth();
  const { showToast } = useToast();
  const [unlinking, setUnlinking] = useState(null);

  const connectedProviders = user?.providers || [];
  const hasGoogle = connectedProviders.some(p => p.name === 'google');
  const hasFacebook = connectedProviders.some(p => p.name === 'facebook');

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
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text)' }}>
              Dashboard
            </h1>

            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="rounded-lg shadow-soft p-6 mb-6"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Profile Information
              </h2>
              
              <div className="flex items-start gap-6">
                {/* Avatar */}
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
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
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--color-accent)',
                    boxShadow: '0 0 0 4px var(--color-accent-light)',
                    display: user?.avatar ? 'none' : 'flex'
                  }}
                >
                  <User size={32} className="text-white" />
                </div>

                {/* User Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    <span className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                      {user?.name || 'Unknown User'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>
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
              className="rounded-lg shadow-soft p-6"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Connected Accounts
              </h2>

              <div className="space-y-4">
                {/* Google Account */}
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div className="flex items-center gap-3">
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
                  
                  {hasGoogle ? (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Unlink}
                      onClick={() => handleUnlinkProvider('google')}
                      loading={unlinking === 'google'}
                      disabled={connectedProviders.length <= 1}
                    >
                      Unlink
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      onClick={() => handleLinkProvider('google')}
                    >
                      Link
                    </Button>
                  )}
                </div>

                {/* Facebook Account */}
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-facebook)' }}>
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
                  
                  {hasFacebook ? (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Unlink}
                      onClick={() => handleUnlinkProvider('facebook')}
                      loading={unlinking === 'facebook'}
                      disabled={connectedProviders.length <= 1}
                    >
                      Unlink
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      onClick={() => handleLinkProvider('facebook')}
                    >
                      Link
                    </Button>
                  )}
                </div>
              </div>

              {connectedProviders.length <= 1 && (
                <p className="mt-4 text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
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
