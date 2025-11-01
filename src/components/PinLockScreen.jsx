import React, { useState, useEffect } from 'react';
import Logo from './Logo';

export default function PinLockScreen({ correctPin, onUnlock, onForgotPin }) {
    const [pin, setPin] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const handleInput = (num) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const handleForgot = () => {
        if (onForgotPin) {
            onForgotPin();
        }
    };

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === correctPin) {
                onUnlock();
            } else {
                setIsShaking(true);
                setPin('');
                setTimeout(() => setIsShaking(false), 500);
            }
        }
    }, [pin, correctPin, onUnlock]);

    const PinDots = () => (
        <div className={`flex space-x-4 ${isShaking ? 'shake' : ''}`}>
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                    style={{ backgroundColor: i < pin.length ? 'var(--color-primary-hex)' : '' }}
                ></div>
            ))}
        </div>
    );

    const PinButton = ({ num, letters }) => (
        <button
            onClick={() => handleInput(num.toString())}
            className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white text-3xl font-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
            style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
        >
            {num}
            {letters && <div className="text-xs tracking-widest text-slate-500 dark:text-slate-400">{letters}</div>}
        </button>
    );

    return (
        <div className="flex flex-col items-center justify-between h-full w-full bg-slate-100 dark:bg-slate-900 p-8">
            <div className="flex flex-col items-center pt-16">
                <Logo className="w-12 h-12" />
                <h2 className="text-xl text-slate-800 dark:text-white font-medium mt-4">Enter PIN</h2>
            </div>

            <PinDots />

            <div className="grid grid-cols-3 gap-6">
                <PinButton num={1} />
                <PinButton num={2} letters="ABC" />
                <PinButton num={3} letters="DEF" />
                <PinButton num={4} letters="GHI" />
                <PinButton num={5} letters="JKL" />
                <PinButton num={6} letters="MNO" />
                <PinButton num={7} letters="PQRS" />
                <PinButton num={8} letters="TUV" />
                <PinButton num={9} letters="WXYZ" />
                
                <button 
                    onClick={handleForgot}
                    className="w-20 h-20 rounded-full text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
                    style={{
                        color: 'var(--color-primary-hex)',
                        '--tw-ring-color': 'var(--color-primary-hex)'
                    }}
                >
                    Forgot?
                </button>
                
                <PinButton num={0} />

                <button
                    onClick={handleDelete}
                    className="w-20 h-20 rounded-full text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
                    style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
