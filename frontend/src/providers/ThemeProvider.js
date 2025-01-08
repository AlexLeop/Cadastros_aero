import React, { createContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

export const ColorModeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        []
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: '#1976d2',
                    },
                    secondary: {
                        main: '#dc004e',
                    },
                },
                components: {
                    MuiTextField: {
                        defaultProps: {
                            variant: 'outlined',
                            size: 'small',
                        },
                    },
                    MuiButton: {
                        defaultProps: {
                            size: 'medium',
                        },
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                            },
                        },
                    },
                },
            }, ptBR),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ColorModeContext.Provider>
    );
}; 