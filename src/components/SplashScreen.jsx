import React from 'react';
import Logo from './Logo';
import { motion } from 'framer-motion';

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
        delay: 1.0,
        duration: 0.5
    }
  }
};

export default function SplashScreen() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-100 dark:bg-slate-900">
            <div className="flex flex-col items-center">
                <Logo className="w-16 h-16" animate={true} />
                <motion.span 
                    style={{ fontFamily: 'var(--font-logo)' }} 
                    className="text-4xl text-slate-900 dark:text-white mt-4 italic"
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                >
                    Curiosity
                </motion.span>
            </div>
        </div>
    );
}