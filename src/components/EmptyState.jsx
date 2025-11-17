import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function EmptyState({ 
    icon: Icon, 
    title, 
    description, 
    actionText, 
    onAction,
    illustration 
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            {illustration ? (
                <div className="mb-6">
                    {illustration}
                </div>
            ) : Icon && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="mb-6 p-6 rounded-full"
                    style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}
                >
                    <Icon size={48} style={{ color: 'var(--color-primary-hex)' }} className="opacity-60" />
                </motion.div>
            )}
            
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-3"
                style={{ 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-serif)'
                }}
            >
                {title}
            </motion.h3>
            
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base mb-8 max-w-md"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                {description}
            </motion.p>
            
            {onAction && actionText && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={onAction}
                    className="flex items-center space-x-2 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    style={{ 
                        backgroundColor: 'var(--color-primary-hex)',
                        color: 'white'
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus size={20} />
                    <span>{actionText}</span>
                </motion.button>
            )}
        </motion.div>
    );
}
