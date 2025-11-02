import React, { useState } from 'react';
import { Lock, Fingerprint } from 'lucide-react';
import Logo from './Logo';
import { verifyPin } from '../utils.js'; // Import the new verifyPin function
import { useAppContext } from '../context/AppContext';

function PinLockScreen({ onUnlock, onForgotPin }) {
    const { appPin: correctPinHash } = useAppContext(); // Get the hash from context
    const [enteredPin, setEnteredPin] = useState('');
    const [error, setError] = useState('');

    const handlePinChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 4) {
            setEnteredPin(val);
            setError('');
        }
    };

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        if (enteredPin.length !== 4) {
            setError('PIN must be 4 digits.');
            return;
        }

        const isCorrect = await verifyPin(enteredPin, correctPinHash);

        if (isCorrect) {
            onUnlock();
        } else {
            setError('Incorrect PIN. Please try again.');
            setEnteredPin('');
        }
    };
    
    const handleDigitClick = (digit) => {
        if (enteredPin.length < 4) {
            setEnteredPin(enteredPin + digit);
            setError('');
        }
    };
    
    const handleDelete = () => {
         setEnteredPin(enteredPin.slice(0, -1));
         setError('');
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-4">
            <Logo className="w-16 h-16" />
            <h1 style={{ fontFamily: 'var(--font-logo)' }} className="text-4xl mt-2">Curiosity</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-gray-300">Enter your PIN to unlock</p>
            
            <form onSubmit={handlePinSubmit} className="mt-8 w-full max-w-xs">
                <div className="flex justify-center space-x-4 mb-4">
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full transition-colors ${
                                enteredPin.length > i ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                            style={{ backgroundColor: enteredPin.length > i ? 'var(--color-primary-hex)' : undefined }}
                        ></div>
                    ))}
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                )}
                
                <input
                    type="password"
                    value={enteredPin}
                    onChange={handlePinChange}
                    maxLength={4}
                    className="opacity-0 absolute w-0 h-0" // Hide the input, use numpad
                    autoFocus
                />
                
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                        <button
                            type="button"
                            key={digit}
                            onClick={() => handleDigitClick(digit.toString())}
                            className="text-3xl font-light h-16 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                        >
                            {digit}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={onForgotPin}
                        className="text-sm font-medium h-16 rounded-lg text-primary"
                        style={{ color: 'var(--color-primary-hex)' }}
                    >
                        Forgot PIN
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDigitClick('0')}
                        className="text-3xl font-light h-16 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                        0
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="flex items-center justify-center text-sm font-medium h-16 rounded-lg text-slate-600 dark:text-gray-300"
                    >
                        <Fingerprint size={24} />
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 py-3 rounded-lg text-white font-semibold text-lg bg-primary"
                    style={{ backgroundColor: 'var(--color-primary-hex)' }}
                >
                    Unlock
                </button>
            </form>
        </div>
    );
}

export default PinLockScreen;
