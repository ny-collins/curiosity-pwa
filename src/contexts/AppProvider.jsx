
import React from 'react';
import { StateProvider } from './StateProvider';

export function AppProvider({ children }) {
    return (
        <StateProvider>
            {children}
        </StateProvider>
    );
}
