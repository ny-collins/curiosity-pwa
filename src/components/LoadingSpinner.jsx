// src/components/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-full bg-slate-900">
            <Loader2 className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" />
        </div>
    );
}

export default LoadingSpinner;
