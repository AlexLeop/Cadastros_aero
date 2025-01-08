import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import recordsReducer from '../../../features/records/recordsSlice';
import RecordsList from '../RecordsList';
import { ThemeProvider } from '../../../providers/ThemeProvider';
import NotificationProvider from '../../../providers/NotificationProvider';

const renderWithProviders = (component) => {
    const store = configureStore({
        reducer: {
            records: recordsReducer
        }
    });

    return render(
        <Provider store={store}>
            <ThemeProvider>
                <NotificationProvider>
                    <BrowserRouter>
                        {component}
                    </BrowserRouter>
                </NotificationProvider>
            </ThemeProvider>
        </Provider>
    );
};

describe('RecordsList', () => {
    it('renders records table with data', async () => {
        renderWithProviders(<RecordsList />);

        // Verificar loading state
        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        // Verificar se os registros são carregados
        await waitFor(() => {
            expect(screen.getByText('value1')).toBeInTheDocument();
            expect(screen.getByText('value2')).toBeInTheDocument();
        });
    });

    it('filters records by status', async () => {
        renderWithProviders(<RecordsList />);

        // Esperar carregar os dados
        await waitFor(() => {
            expect(screen.getByText('value1')).toBeInTheDocument();
        });

        // Selecionar filtro de status
        const statusSelect = screen.getByLabelText('Status');
        fireEvent.change(statusSelect, { target: { value: 'validated' } });

        // Verificar se o filtro foi aplicado
        await waitFor(() => {
            expect(screen.queryByText('value1')).not.toBeInTheDocument();
            expect(screen.getByText('value2')).toBeInTheDocument();
        });
    });

    it('handles record deletion', async () => {
        renderWithProviders(<RecordsList />);

        // Esperar carregar os dados
        await waitFor(() => {
            expect(screen.getByText('value1')).toBeInTheDocument();
        });

        // Clicar no botão de excluir
        const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
        fireEvent.click(deleteButtons[0]);

        // Confirmar exclusão
        window.confirm = jest.fn(() => true);
        
        // Verificar se o registro foi removido
        await waitFor(() => {
            expect(screen.queryByText('value1')).not.toBeInTheDocument();
        });
    });
}); 