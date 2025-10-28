import React, { useState, useEffect, useCallback } from 'react';
import { KeyRound, Delete } from 'lucide-react'; 

function PinLockScreen({ correctPin, onUnlock, onForgotPin }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleInput = useCallback((num) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    }, [pin]); 

    const handleBackspace = useCallback(() => {
        setPin(pin.slice(0, -1));
    }, [pin]); 

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key >= '0' && event.key <= '9') {
                event.preventDefault(); 
                handleInput(event.key);
            } else if (event.key === 'Backspace') {
                event.preventDefault(); 
                handleBackspace();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleInput, handleBackspace]); 

    // --- Auto-submit Logic ---
    useEffect(() => {
        if (pin.length === 4) {
            if (pin === correctPin) {
                onUnlock();
            } else {
                setError(true);
                setTimeout(() => {
                    setError(false);
                    setPin('');
                }, 500);
            }
        }
    }, [pin, correctPin, onUnlock]);


    const keypad = [
        '1', '2', '3',
        '4', '5', '6',
        '7', '8', '9',
        '', '0', 'Backspace'
    ];

    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50 p-4">
            <KeyRound size={48} className="text-teal-400 mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Enter PIN</h2>
            <div className={`flex space-x-4 mb-8 ${error ? 'shake' : ''}`}>
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`pin-dot w-4 h-4 rounded-full ${pin.length > i ? 'bg-teal-400' : 'bg-slate-700'} ${error ? 'bg-red-500' : ''}`}
                    ></div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4 w-64">
                {keypad.map((key) => (
                    <button
                        key={key}
                        onClick={() => key === 'Backspace' ? handleBackspace() : (key ? handleInput(key) : null)}
                        disabled={!key}
                        className={`text-2xl font-semibold text-white rounded-full h-16 w-16 flex items-center justify-center transition-colors
                            ${key ? 'bg-slate-800 hover:bg-slate-700 focus:ring-2 focus:ring-teal-500' : 'bg-transparent'}
                        `}
                    >
                        {key === 'Backspace' ? <Delete size={28} /> : key}
                    </button>
                ))}
            </div>
            <div className="mt-8">
                <button
                    onClick={onForgotPin}
                    className="text-sm text-teal-400 hover:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
                >
                    Forgot PIN?
                </button>
            </div>
        </div>
    );
}

export default PinLockScreen;
