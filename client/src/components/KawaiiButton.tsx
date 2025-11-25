import { motion } from 'framer-motion';
import { ReactNode, ButtonHTMLAttributes } from 'react';
import './KawaiiButton.css';

interface KawaiiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
}

export default function KawaiiButton({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  className = '',
  ...props
}: KawaiiButtonProps) {
  return (
    <motion.button
      className={`kawaii-button ${variant} ${size} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </motion.button>
  );
}
