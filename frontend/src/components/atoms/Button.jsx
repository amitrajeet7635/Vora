// Button Component - Reusable button with different variants
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'text-white shadow-lg hover:shadow-xl',
    google: 'text-white shadow-lg hover:shadow-xl',
    facebook: 'text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 bg-transparent shadow-sm hover:shadow-md',
    ghost: 'bg-transparent',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-lg',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  // Inline styles for theme-aware colors using CSS variables
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--color-accent)',
          color: '#FFFFFF',
        };
      case 'google':
        return {
          backgroundColor: 'var(--color-google)',
          color: '#FFFFFF',
        };
      case 'facebook':
        return {
          backgroundColor: 'var(--color-facebook)',
          color: '#FFFFFF',
        };
      case 'outline':
        return {
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          backgroundColor: 'transparent',
        };
      case 'ghost':
        return {
          color: 'var(--color-text)',
        };
      default:
        return {};
    }
  };

  const handleHover = (e) => {
    if (disabled || loading) return;
    if (variant === 'google') {
      e.currentTarget.style.backgroundColor = 'var(--color-google-hover)';
    } else if (variant === 'facebook') {
      e.currentTarget.style.backgroundColor = 'var(--color-facebook-hover)';
    } else if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
    } else if (variant === 'outline') {
      e.currentTarget.style.backgroundColor = 'var(--color-card)';
    }
  };

  const handleHoverEnd = (e) => {
    if (disabled || loading) return;
    if (variant === 'google') {
      e.currentTarget.style.backgroundColor = 'var(--color-google)';
    } else if (variant === 'facebook') {
      e.currentTarget.style.backgroundColor = 'var(--color-facebook)';
    } else if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = 'var(--color-accent)';
    } else if (variant === 'outline') {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={getVariantStyles()}
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverEnd}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon size={20} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={20} />}
    </motion.button>
  );
};
