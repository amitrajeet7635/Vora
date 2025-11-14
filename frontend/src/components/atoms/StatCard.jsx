// StatCard Component - Displays a single statistic with icon
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  iconBgColor,
  delay = 0,
  valueColor 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-lg shadow-soft p-4"
      style={{ backgroundColor: 'var(--color-card)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {title}
          </p>
          <p 
            className="text-lg font-semibold mt-1" 
            style={{ color: valueColor || 'var(--color-text)' }}
          >
            {value}
          </p>
        </div>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center" 
          style={{ backgroundColor: iconBgColor || 'var(--color-accent-light)' }}
        >
          <Icon 
            size={20} 
            style={{ color: iconColor || 'var(--color-accent)' }} 
          />
        </div>
      </div>
    </motion.div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string,
  iconBgColor: PropTypes.string,
  delay: PropTypes.number,
  valueColor: PropTypes.string,
};
