import { useSnackbar } from 'notistack';

export const useNotification = () => {
    const { enqueueSnackbar } = useSnackbar();

    const showNotification = (message, variant = 'info', options = {}) => {
        enqueueSnackbar(message, {
            variant,
            autoHideDuration: 3000,
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
            ...options
        });
    };

    return { showNotification };
}; 