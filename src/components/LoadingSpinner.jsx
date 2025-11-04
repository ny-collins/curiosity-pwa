import React from 'react';
import { Loader2 } from 'lucide-react';

function LoadingSpinner({ className = "" }) {
    return (
        <Loader2 
            className={`animate-spin h-6 w-6 ${className}`}
        />
    );
}

export default LoadingSpinner;