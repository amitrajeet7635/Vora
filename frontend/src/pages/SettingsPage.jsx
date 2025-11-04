// Settings Page - Account settings and theme toggle
import { motion } from 'framer-motion';
import { Moon, Sun, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/molecules/Toast';
import { Button } from '../components/atoms/Button';
import { Navbar } from '../components/organisms/Navbar';
import { ThemeToggleButton } from '../components/atoms/ThemeToggleButton';
import { useState } from 'react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      showToast('Profile updated successfully!', 'success');
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar />
      
      <div className="pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8" style={{ color: 'var(--color-text)' }}>
              Settings
            </h1>

            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="rounded-lg shadow-soft p-4 sm:p-6 mb-4 sm:mb-6"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <UserIcon size={20} style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                  Profile Settings
                </h2>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Avatar Preview */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
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
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'var(--color-accent)',
                        boxShadow: '0 0 0 4px var(--color-accent-light)',
                        display: user?.avatar ? 'none' : 'flex'
                      }}
                    >
                      <UserIcon size={24} className="text-white" />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Profile picture is synced from your connected accounts
                    </p>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg transition-all focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      '--tw-ring-color': 'var(--color-accent)'
                    }}
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 rounded-lg cursor-not-allowed"
                    style={{ 
                      backgroundColor: 'var(--color-disabled-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)'
                    }}
                  />
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Email is managed by your connected accounts
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </form>
            </motion.div>

            {/* Appearance Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-lg shadow-soft p-4 sm:p-6 mb-4 sm:mb-6"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                {theme === 'dark' ? (
                  <Moon size={20} style={{ color: 'var(--color-accent)' }} />
                ) : (
                  <Sun size={20} style={{ color: 'var(--color-accent)' }} />
                )}
                <h2 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                  Appearance
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  Choose how Vora looks to you. Select a theme that suits your preference.
                </p>

                {/* Theme Toggle Section */}
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                      Theme Mode
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Current: {theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
                    </p>
                  </div>
                  
                  <ThemeToggleButton variant="switch" showLabel={true} />
                </div>

                {/* Theme Info */}
                <div className="p-3 rounded-lg" style={{ 
                  backgroundColor: 'var(--color-accent-light)',
                  border: '1px solid var(--color-accent)'
                }}>
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                    <strong>✨ Tip:</strong> Your theme preference is automatically saved and will be remembered across sessions.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Security Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="rounded-lg shadow-soft p-4 sm:p-6"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                  Security
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  Your account is secured with OAuth 2.0. Manage your connected accounts from the Dashboard.
                </p>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-accent-light)', border: '1px solid var(--color-accent-dark)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                    <strong>Security Note:</strong> We never store your passwords. Authentication is handled securely by Google and Facebook.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
