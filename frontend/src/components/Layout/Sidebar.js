import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Upload as UploadIcon,
    ListAlt as RecordsIcon,
    Settings as SettingsIcon,
    People as UsersIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Upload', icon: <UploadIcon />, path: '/upload' },
    { text: 'Registros', icon: <RecordsIcon />, path: '/records' },
    { text: 'Usuários', icon: <UsersIcon />, path: '/users', admin: true },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/settings', admin: true }
];

const Sidebar = ({ open, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) onClose();
    };

    const filteredMenuItems = menuItems.filter(
        item => !item.admin || user?.is_admin
    );

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            open={open}
            onClose={onClose}
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    mt: 8
                },
            }}
        >
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {filteredMenuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar; 