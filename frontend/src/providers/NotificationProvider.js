import React from 'react';
import { SnackbarProvider } from 'notistack';
import { IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const NotificationProvider = ({ children }) => {
    const notistackRef = React.createRef();

    const onClickDismiss = (key) => () => {
        notistackRef.current.closeSnackbar(key);
    };

    return (
        <SnackbarProvider
            ref={notistackRef}
            maxSnack={3}
            action={(key) => (
                <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={onClickDismiss(key)}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            )}
        >
            {children}
        </SnackbarProvider>
    );
};

export default NotificationProvider; 