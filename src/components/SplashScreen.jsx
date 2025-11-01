import React from 'react';
import Logo from './Logo';

export default function SplashScreen() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-100 dark:bg-slate-900">
            <div className="flex flex-col items-center animate-pulse">
                <Logo className="w-16 h-16" />
                <span 
                    style={{ fontFamily: 'var(--font-logo)' }} 
                    className="text-4xl text-slate-900 dark:text-white mt-4"
                >
                    Curiosity
                </span>
            </div>
        </div>
    );
}
