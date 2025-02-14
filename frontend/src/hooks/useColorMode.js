import { useContext } from 'react';
import { ColorModeContext } from '../providers/ThemeProvider';

export const useColorMode = () => {
    const context = useContext(ColorModeContext);
    if (!context) {
        throw new Error('useColorMode must be used within a ThemeProvider');
    }
    return context;
}; 