import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-emerald-900 flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      className="text-center"
    >
      <div className="flex items-center gap-1 mb-4">
        <span className="text-5xl font-black text-emerald-400">Eco</span>
        <span className="text-5xl font-black text-white">Mart</span>
      </div>
      <div className="flex gap-2 justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
            className="w-3 h-3 bg-emerald-400 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  </div>
);

export default LoadingScreen;