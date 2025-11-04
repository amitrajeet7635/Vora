// Navbar Component
import { motion } from 'framer-motion';
import { User, LogOut, Settings, Github } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggleButton } from '../atoms/ThemeToggleButton';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b" style={{ backgroundColor: 'var(--color-navbar-bg)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.h1
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text)' }}
              whileHover={{ scale: 1.05 }}
            >
              Vora
            </motion.h1>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Sign in Smarter.
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <ThemeToggleButton variant="icon" />

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-text)' }}
              aria-label="GitHub"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-card)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Github size={20} />
            </a>

            {/* User Menu */}
            {isAuthenticated && user && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-card)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
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
                    className="w-8 h-8 rounded-full flex items-center justify-center" 
                    style={{ 
                      backgroundColor: 'var(--color-accent)',
                      display: user.avatar ? 'none' : 'flex'
                    }}
                  >
                    <User size={18} className="text-white" />
                  </div>
                </motion.button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-soft-dark z-20"
                      style={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div className="p-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          {user.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                          {user.email}
                        </p>
                      </div>
                      <div className="p-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors"
                          style={{ color: 'var(--color-text)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <User size={16} />
                          Dashboard
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors"
                          style={{ color: 'var(--color-text)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors"
                          style={{ color: 'var(--color-danger)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
