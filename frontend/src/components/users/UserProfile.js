import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Grid,
    TextField,
    Button,
    Avatar,
    Typography,
    Box,
    Divider,
    CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNotification } from '../../hooks/useNotification';
import authService from '../../services/authService';

const validationSchema = Yup.object({
    name: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    current_password: Yup.string().when('new_password', {
        is: value => value?.length > 0,
        then: Yup.string().required('Senha atual é obrigatória')
    }),
    new_password: Yup.string().min(8, 'Mínimo de 8 caracteres'),
    confirm_password: Yup.string().oneOf(
        [Yup.ref('new_password')],
        'As senhas não conferem'
    )
});

const UserProfile = () => {
    const user = useSelector(state => state.auth.user);
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
            current_password: '',
            new_password: '',
            confirm_password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                // Atualizar perfil
                await authService.updateProfile({
                    name: values.name,
                    email: values.email
                });

                // Se houver nova senha, atualizar
                if (values.new_password) {
                    await authService.changePassword({
                        current_password: values.current_password,
                        new_password: values.new_password
                    });
                }

                showNotification('Perfil atualizado com sucesso', 'success');
                formik.resetForm({
                    values: {
                        ...values,
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                    }
                });
            } catch (error) {
                showNotification(
                    error.response?.data?.message || 'Erro ao atualizar perfil',
                    'error'
                );
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <Card>
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} display="flex" alignItems="center" gap={2}>
                        <Avatar
                            src={user?.avatar}
                            alt={user?.name}
                            sx={{ width: 80, height: 80 }}
                        />
                        <Box>
                            <Typography variant="h5">
                                {user?.name}
                            </Typography>
                            <Typography color="textSecondary">
                                {user?.email}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Informações Pessoais
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            name="name"
                            label="Nome"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            name="email"
                            label="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Alterar Senha
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="password"
                            name="current_password"
                            label="Senha Atual"
                            value={formik.values.current_password}
                            onChange={formik.handleChange}
                            error={formik.touched.current_password && Boolean(formik.errors.current_password)}
                            helperText={formik.touched.current_password && formik.errors.current_password}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="password"
                            name="new_password"
                            label="Nova Senha"
                            value={formik.values.new_password}
                            onChange={formik.handleChange}
                            error={formik.touched.new_password && Boolean(formik.errors.new_password)}
                            helperText={formik.touched.new_password && formik.errors.new_password}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="password"
                            name="confirm_password"
                            label="Confirmar Nova Senha"
                            value={formik.values.confirm_password}
                            onChange={formik.handleChange}
                            error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
                            helperText={formik.touched.confirm_password && formik.errors.confirm_password}
                        />
                    </Grid>
                </Grid>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button
                    variant="contained"
                    onClick={formik.handleSubmit}
                    disabled={loading || !formik.dirty || !formik.isValid}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </CardActions>
        </Card>
    );
};

export default UserProfile; 