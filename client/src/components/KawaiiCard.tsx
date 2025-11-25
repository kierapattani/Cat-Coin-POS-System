import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import './KawaiiCard.css';

interface KawaiiCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function KawaiiCard({ children, className = '', hoverable = false, onClick }: KawaiiCardProps) {
  return (
    <motion.div
      className={`kawaii-card ${hoverable ? 'hoverable' : ''} ${className}`}
      onClick={onClick}
      whileHover={hoverable ? { scale: 1.02, y: -4 } : {}}
      whileTap={hoverable ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
