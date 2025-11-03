// Theme Toggle Button - Animated light/dark mode switcher
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggleButton = ({ variant = 'icon', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const iconVariants = {
    initial: { rotate: 0, scale: 0.8, opacity: 0 },
    animate: { 
      rotate: 360, 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeInOut' }
    },
    exit: { 
      rotate: -360, 
      scale: 0.8, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  if (variant === 'switch') {
    return (
      <div className="flex items-center gap-3">
        {showLabel && (
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Theme
          </span>
        )}
        <motion.button
          onClick={toggleTheme}
          className="relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: isDark ? 'var(--color-accent)' : '#CBD5E1',
            '--tw-ring-color': 'var(--color-accent)'
          }}
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          <motion.span
            className="inline-flex h-8 w-8 transform items-center justify-center rounded-full bg-white shadow-lg"
            initial={false}
            animate={{
              x: isDark ? 44 : 4,
              transition: { type: 'spring', stiffness: 500, damping: 30 }
            }}
          >
            <motion.div
              key={theme}
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {isDark ? (
                <Moon size={18} className="text-gray-700" />
              ) : (
                <Sun size={18} className="text-yellow-500" />
              )}
            </motion.div>
          </motion.span>
        </motion.button>
        {showLabel && (
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
      </div>
    );
  }

  // Default icon variant for navbar
  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        backgroundColor: 'var(--color-card)',
        color: 'var(--color-text)',
        '--tw-ring-color': 'var(--color-accent)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={theme}
        variants={iconVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isDark ? (
          <Moon size={20} style={{ color: 'var(--color-accent)' }} />
        ) : (
          <Sun size={20} style={{ color: '#F59E0B' }} />
        )}
      </motion.div>
    </motion.button>
  );
};
