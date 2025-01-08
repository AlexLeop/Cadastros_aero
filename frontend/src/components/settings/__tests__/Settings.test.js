import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Settings from '../Settings';
import { ThemeProvider } from '../../../providers/ThemeProvider';
import NotificationProvider from '../../../providers/NotificationProvider';

const renderWithProviders = (component) => {
    const store = configureStore({
        reducer: {}
    });

    return render(
        <Provider store={store}>
            <ThemeProvider>
                <NotificationProvider>
                    {component}
                </NotificationProvider>
            </ThemeProvider>
        </Provider>
    );
};

describe('Settings', () => {
    it('loads and displays settings', async () => {
        renderWithProviders(<Settings />);

        // Verificar loading state
        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        // Verificar se as configurações são carregadas
        await waitFor(() => {
            expect(screen.getByLabelText(/tamanho máximo/i)).toHaveValue(10);
            expect(screen.getByLabelText(/extensões permitidas/i)).toHaveValue('.pdf,.csv,.xlsx');
        });
    });

    it('updates settings when changed', async () => {
        renderWithProviders(<Settings />);

        // Esperar carregar as configurações
        await waitFor(() => {
            expect(screen.getByLabelText(/tamanho máximo/i)).toBeInTheDocument();
        });

        // Alterar valor do campo
        const maxSizeInput = screen.getByLabelText(/tamanho máximo/i);
        fireEvent.change(maxSizeInput, { target: { value: '20' } });

        // Verificar se o valor foi atualizado
        expect(maxSizeInput).toHaveValue(20);
    });

    it('saves settings successfully', async () => {
        renderWithProviders(<Settings />);

        // Esperar carregar as configurações
        await waitFor(() => {
            expect(screen.getByLabelText(/tamanho máximo/i)).toBeInTheDocument();
        });

        // Alterar configurações
        const maxSizeInput = screen.getByLabelText(/tamanho máximo/i);
        fireEvent.change(maxSizeInput, { target: { value: '20' } });

        // Clicar no botão de salvar
        const saveButton = screen.getByRole('button', { name: /salvar/i });
        fireEvent.click(saveButton);

        // Verificar mensagem de sucesso
        await waitFor(() => {
            expect(screen.getByText(/configurações salvas/i)).toBeInTheDocument();
        });
    });
}); 