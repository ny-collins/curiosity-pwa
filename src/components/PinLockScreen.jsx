import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Delete } from 'lucide-react';
import { LIMITS } from '../constants.js';
import { useAppContext } from '../context/AppContext.jsx';

const PinDigit = ({ hasValue }) => {
    return (
        <motion.div
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`w-4 h-4 rounded-full ${hasValue ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
            style={{ backgroundColor: hasValue ? 'var(--color-primary-hex)' : '' }}
        />
    );
};

const PinKey = ({ value, onClick, children }) => (
    <motion.button
        onClick={() => onClick(value)}
        className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-2xl font-semibold flex items-center justify-center
                   focus:outline-none focus:ring-2"
        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
        whileTap={{ scale: 0.9 }}
    >
        {children || value}
    </motion.button>
);

export default function PinLockScreen({ onUnlock, onForgotPin, checkPin }) {
    const { setUnlockedPin } = useAppContext();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    
    const pinLength = LIMITS.PIN_LENGTH;

    const handleKeyClick = useCallback((value) => {
        if (pin.length < pinLength) {
            setPin(pin + value);
        }
    }, [pin, pinLength]);

    const handleDeleteClick = useCallback(() => {
        setPin(pin.slice(0, -1));
    }, [pin]);

    const handleSubmit = useCallback(async () => {
        if (!checkPin) {
            console.error("checkPin function not provided to PinLockScreen");
            setError(true);
            setTimeout(() => setPin(''), 500);
            return;
        }
        
        const isValid = await checkPin(pin);
        if (isValid) {
            setUnlockedPin(pin);
            onUnlock();
        } else {
            setError(true);
            setTimeout(() => setPin(''), 500);
        }
    }, [checkPin, pin, onUnlock, setUnlockedPin]);

    useEffect(() => {
        if (pin.length === pinLength) {
            handleSubmit();
        }
        if (error && pin.length < pinLength) {
            setError(false);
        }
    }, [pin, handleSubmit, error, pinLength]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key >= '0' && event.key <= '9') {
                handleKeyClick(event.key);
            } else if (event.key === 'Backspace') {
                handleDeleteClick();
            } else if (event.key === 'Enter' && pin.length === pinLength) {
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [pin, pinLength, handleKeyClick, handleDeleteClick, handleSubmit]);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
            >
                <Key 
                    size={48} 
                    className="mb-4 text-primary"
                    style={{ color: 'var(--color-primary-hex)' }}
                />
                <span className="text-lg font-medium mt-4 mb-2">Enter your PIN</span>
            </motion.div>

            <motion.div
                animate={{ x: error ? [-5, 5, -5, 5, 0] : 0 }}
                transition={{ duration: 0.3 }}
                className="flex space-x-4 my-6"
            >
                <AnimatePresence>
                    {Array.from({ length: pinLength }).map((_, i) => (
                        <PinDigit key={i} hasValue={i < pin.length} />
                    ))}
                </AnimatePresence>
            </motion.div>
            
            {error && <span className="text-red-500 text-sm mb-4 -mt-2">Incorrect PIN. Try again.</span>}

            <div className="grid grid-cols-3 gap-6">
                <PinKey value="1" onClick={handleKeyClick} />
                <PinKey value="2" onClick={handleKeyClick} />
                <PinKey value="3" onClick={handleKeyClick} />
                <PinKey value="4" onClick={handleKeyClick} />
                <PinKey value="5" onClick={handleKeyClick} />
                <PinKey value="6" onClick={handleKeyClick} />
                <PinKey value="7" onClick={handleKeyClick} />
                <PinKey value="8" onClick={handleKeyClick} />
                <PinKey value="9" onClick={handleKeyClick} />
                <button 
                    onClick={onForgotPin}
                    className="w-16 h-16 text-sm font-medium text-primary focus:outline-none"
                    style={{ color: 'var(--color-primary-hex)' }}
                >
                    Forgot?
                </button>
                <PinKey value="0" onClick={handleKeyClick} />
                <PinKey onClick={handleDeleteClick}>
                    <Delete size={24} />
                </PinKey>
            </div>
        </div>
    );
}