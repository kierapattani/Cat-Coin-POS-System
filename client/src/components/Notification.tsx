import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import './Notification.css';

export default function Notification() {
  const { notification, hideNotification } = useStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  const getIcon = () => {
    switch (notification?.type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className={`notification notification-${notification.type}`}
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="notification-icon">{getIcon()}</div>
          <div className="notification-message">{notification.message}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
