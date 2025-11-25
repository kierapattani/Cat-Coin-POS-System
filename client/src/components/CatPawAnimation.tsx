import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import './CatPawAnimation.css';

export default function CatPawAnimation() {
  const showPaymentAnimation = useStore((state) => state.showPaymentAnimation);

  return (
    <AnimatePresence>
      {showPaymentAnimation && (
        <motion.div
          className="cat-paw-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="cat-paw"
            initial={{ x: '100%', rotate: -45 }}
            animate={{
              x: [
                '100%',
                '50%',
                '20%',
                '-20%',
              ],
              rotate: [-45, -30, -15, 0],
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.4, 0.7, 1],
              ease: 'easeInOut',
            }}
          >
            <div className="paw-pad">
              <div className="main-pad">🐾</div>
            </div>
          </motion.div>

          <motion.div
            className="money-icon"
            initial={{ scale: 1, x: 0, y: 0 }}
            animate={{
              scale: [1, 0.8, 0.5, 0],
              x: ['0%', '20%', '40%', '60%'],
              y: ['0%', '-10%', '-5%', '0%'],
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.5, 0.75, 1],
              ease: 'easeInOut',
            }}
          >
            💰
          </motion.div>

          <motion.div
            className="sparkles"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.5 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                className="sparkle"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: 0,
                }}
              >
                ✨
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            className="success-message"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
          >
            <div className="success-text">Payment Received!</div>
            <div className="cat-thanks">(=^・ω・^)ノ Thank mew!</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
