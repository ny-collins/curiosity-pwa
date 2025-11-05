
import React from 'react';
import { AuthProvider } from './AuthContext';
import { UIProvider } from './UIContext';
import { DataProvider } from './DataContext';
import { FeatureProvider } from './FeatureContext';

export function AppProvider({ children }) {
    return (
        <AuthProvider>
            <UIProvider>
                <DataProvider>
                    <FeatureProvider>
                        {children}
                    </FeatureProvider>
                </DataProvider>
            </UIProvider>
        </AuthProvider>
    );
}
