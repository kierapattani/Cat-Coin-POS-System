import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import './CatPawAnimation.css';

export default function CatPawAnimation() {
  const showPaymentAnimation = useStore((state) => state.showPaymentAnimation);

  return (
    <AnimatePresence>
      {showPaymentAnimation && (
        <motion.div
          className="cat-box-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Table */}
          <div className="table">
            <div className="table-top"></div>
            <div className="table-leg left"></div>
            <div className="table-leg right"></div>
          </div>

          {/* Cat Box */}
          <div className="cat-box-container">
            {/* Box Body */}
            <div className="box-body">
              <div className="box-front"></div>
              <div className="box-side left"></div>
              <div className="box-side right"></div>
            </div>

            {/* Box Lid - Back Half */}
            <motion.div
              className="box-lid-back"
              initial={{ rotateX: 0 }}
              animate={{
                rotateX: [0, 0, -35, -35, 0],
              }}
              transition={{
                duration: 2.5,
                times: [0, 0.3, 0.4, 0.8, 1],
                ease: 'easeInOut',
              }}
            >
              <div className="lid-back-surface"></div>
            </motion.div>

            {/* Box Lid - Front Half (static) */}
            <div className="box-lid-front">
              <div className="coin-slot"></div>
            </div>

            {/* Cat Head - Left Side */}
            <motion.div
              className="cat-head left-side"
              initial={{ y: 30, opacity: 0 }}
              animate={{
                y: [30, 30, -10, -10, 30],
                opacity: [0, 0, 1, 1, 0],
              }}
              transition={{
                duration: 2.5,
                times: [0, 0.3, 0.4, 0.8, 1],
                ease: 'easeInOut',
              }}
            >
              <div className="cat-face-illustrated">
                {/* Left Ear */}
                <div className="cat-ear left">
                  <div className="ear-inner"></div>
                </div>
                {/* Right Ear */}
                <div className="cat-ear right">
                  <div className="ear-inner"></div>
                </div>
                {/* Face */}
                <div className="cat-face-circle">
                  {/* Eyes */}
                  <div className="cat-eyes">
                    <div className="cat-eye left">
                      <div className="pupil"></div>
                    </div>
                    <div className="cat-eye right">
                      <div className="pupil"></div>
                    </div>
                  </div>
                  {/* Nose */}
                  <div className="cat-nose"></div>
                  {/* Mouth */}
                  <div className="cat-mouth">
                    <div className="mouth-left"></div>
                    <div className="mouth-right"></div>
                  </div>
                  {/* Whiskers */}
                  <div className="whiskers left">
                    <div className="whisker"></div>
                    <div className="whisker"></div>
                    <div className="whisker"></div>
                  </div>
                  <div className="whiskers right">
                    <div className="whisker"></div>
                    <div className="whisker"></div>
                    <div className="whisker"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Cat Paw */}
            <motion.div
              className="cat-paw-illustrated"
              initial={{ x: 0, opacity: 0 }}
              animate={{
                x: [0, 35, 35, 35, 0],
                opacity: [0, 1, 2, 1, 0],
              }}
              transition={{
                duration: 2.5,
                times: [0, 0.3, 0.45, 0.85, 1],
                ease: 'easeInOut',
              }}
            >
              <div className="paw-shape">
                <div className="paw-pad main"></div>
                <div className="paw-pad toe toe-1"></div>
                <div className="paw-pad toe toe-2"></div>
                <div className="paw-pad toe toe-3"></div>
              </div>
            </motion.div>
          </div>

          {/* Money */}
          <motion.div
            className="money-bill"
            initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
            animate={{
              y: [40, 40, 45, 60],
              x: [0, 0, 5, 5],
              rotate: [0, 0, -5, -5],
              opacity: [1, 1, 1, 0],
            }}
            transition={{
              duration: 2.5,
              times: [0, 0.3, 0.5],
              ease: 'easeInOut',
            }}
          >
            💵
          </motion.div>

          {/* Sparkles */}
          <motion.div
            className="sparkles"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.5 }}
          >
            {[...Array(12)].map((_, i) => (
              <motion.span
                key={i}
                className="sparkle"
                style={{
                  left: `${30 + (i % 4) * 15}%`,
                  top: `${25 + Math.floor(i / 4) * 15}%`,
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.2,
                  delay: 0.3 + (i * 0.08),
                  repeat: 0,
                }}
              >
                ✨
              </motion.span>
            ))}
          </motion.div>

          {/* Success Message */}
          <motion.div
            className="success-message"
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
          >
            <div className="success-text">Payment Received!</div>
            <div className="cat-thanks">(=^・ω・^)ノ Thank mew!</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
