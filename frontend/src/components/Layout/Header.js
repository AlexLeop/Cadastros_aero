import React from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Menu,
    MenuItem,
    Avatar,
    useTheme,
    Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Brightness4 as DarkIcon,
    Brightness7 as LightIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { useColorMode } from '../../hooks/useColorMode';

const Header = ({ toggleSidebar }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { toggleColorMode } = useColorMode();
    const user = useSelector(state => state.auth.user);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <AppBar position="fixed">
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={toggleSidebar}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Sistema de Registros
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton color="inherit" onClick={toggleColorMode}>
                        {theme.palette.mode === 'dark' ? <LightIcon /> : <DarkIcon />}
                    </IconButton>

                    <IconButton color="inherit">
                        <NotificationsIcon />
                    </IconButton>

                    <Tooltip title="Configurações da conta">
                        <IconButton onClick={handleMenu} color="inherit">
                            <Avatar
                                alt={user?.name}
                                src={user?.avatar}
                                sx={{ width: 32, height: 32 }}
                            />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => navigate('/profile')}>
                        Perfil
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/settings')}>
                        Configurações
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                        Sair
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 