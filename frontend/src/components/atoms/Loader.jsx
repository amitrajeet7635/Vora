// Loader Component - Loading spinner
import { motion } from 'framer-motion';

export const Loader = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 6,
    md: 12,
    lg: 16,
  };

  const sizeValue = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className="rounded-full"
        style={{
          width: `${sizeValue * 4}px`,
          height: `${sizeValue * 4}px`,
          border: '4px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-sm animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>
          {text}
        </p>
      )}
    </div>
  );
};

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Loader size="lg" text="Loading..." />
    </div>
  );
};
