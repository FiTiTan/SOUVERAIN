import React from 'react';
import { useTheme } from '../../../ThemeContext';

export const AccountsModule: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div style={{ padding: '2rem', color: theme.text.primary }}>
            <h1>Comptes Externes</h1>
            <p>Agregateur de comptes en cours de construction...</p>
        </div>
    );
};
