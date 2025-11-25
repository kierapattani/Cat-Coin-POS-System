import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import './CatCharacter.css';

export default function CatCharacter() {
  const catMood = useStore((state) => state.catMood);

  const getCatFace = () => {
    switch (catMood) {
      case 'happy':
        return '(=^・ω・^=)';
      case 'worried':
        return '(=˃ᆺ˂=)';
      case 'sleeping':
        return '(=˘ω˘=)';
      default:
        return '(=・ω・=)';
    }
  };

  const getCatExpression = () => {
    switch (catMood) {
      case 'happy':
        return 'Yay! Treats! ✨';
      case 'worried':
        return 'Running low on stock...';
      case 'sleeping':
        return 'Zzz... sleeping on coins...';
      default:
        return 'Ready to help!';
    }
  };

  return (
    <div className="cat-character-container">
      <motion.div
        className={`cat-character ${catMood}`}
        animate={{
          y: catMood === 'sleeping' ? 0 : [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: catMood === 'sleeping' ? 0 : Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="cat-face">{getCatFace()}</div>
        <motion.div
          className="cat-speech-bubble"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {getCatExpression()}
        </motion.div>
      </motion.div>
    </div>
  );
}
