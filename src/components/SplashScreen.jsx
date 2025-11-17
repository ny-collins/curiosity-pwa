import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { motion } from 'framer-motion';

const logoVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      duration: 0.6
    }
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.4,
      duration: 0.6
    }
  }
};

const taglineVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.8,
      duration: 0.6
    }
  }
};

const LoadingDots = () => {
  return (
    <div className="flex space-x-2 mt-8">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: 'var(--color-primary-hex)' }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
};

export default function SplashScreen() {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        setTimeout(() => setShowContent(true), 100);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {/* Background gradient animation */}
            <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at 50% 50%, var(--color-primary-hex) 0%, transparent 70%)`
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Main content */}
            <div className="flex flex-col items-center relative z-10">
                <motion.div
                    variants={logoVariants}
                    initial="hidden"
                    animate={showContent ? "visible" : "hidden"}
                >
                    <Logo className="w-24 h-24 md:w-32 md:h-32" animate={true} />
                </motion.div>

                <motion.div
                    className="text-center mt-6"
                    variants={textVariants}
                    initial="hidden"
                    animate={showContent ? "visible" : "hidden"}
                >
                    <h1
                        style={{ fontFamily: 'var(--font-logo)', color: 'var(--color-text-primary)' }}
                        className="text-5xl md:text-6xl font-bold italic tracking-tight bg-gradient-to-r from-primary via-primary to-primary bg-clip-text"
                    >
                        Curiosity
                    </h1>
                </motion.div>

                <motion.p
                    className="text-base md:text-lg mt-3 font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                    variants={taglineVariants}
                    initial="hidden"
                    animate={showContent ? "visible" : "hidden"}
                >
                    Your Personal Jotter
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showContent ? 1 : 0 }}
                    transition={{ delay: 1.2 }}
                >
                    <LoadingDots />
                </motion.div>
            </div>

            {/* Version badge */}
            <motion.div
                className="absolute bottom-8 text-xs font-medium"
                style={{ color: 'var(--color-text-muted)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1.5 }}
            >
                v1.1.0
            </motion.div>
        </div>
    );
}