import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import theme from './theme';
import NotificationProvider from './providers/NotificationProvider';
import AppRoutes from './routes';
import Layout from './components/layout/Layout';

const App = () => {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <NotificationProvider>
                    <BrowserRouter>
                        <Layout>
                            <AppRoutes />
                        </Layout>
                    </BrowserRouter>
                </NotificationProvider>
            </ThemeProvider>
        </Provider>
    );
};

export default App; 