import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import settingsService from '../../services/settingsService';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const systemSettingsFormik = useFormik({
    initialValues: {
      site_name: '',
      max_upload_size: 10,
      allowed_file_types: '',
      enable_notifications: true,
      notification_email: '',
    },
    validationSchema: Yup.object({
      site_name: Yup.string().required('Nome do site é obrigatório'),
      max_upload_size: Yup.number().min(1).required('Tamanho máximo é obrigatório'),
      allowed_file_types: Yup.string().required('Tipos de arquivo são obrigatórios'),
      notification_email: Yup.string().email('Email inválido'),
    }),
    onSubmit: async (values) => {
      try {
        await settingsService.updateSystemSettings(values);
        enqueueSnackbar('Configurações atualizadas com sucesso', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Erro ao atualizar configurações', { variant: 'error' });
      }
    },
  });

  const userSettingsFormik = useFormik({
    initialValues: {
      default_view: 'list',
      items_per_page: 10,
      enable_email_notifications: true,
      theme: 'light',
    },
    validationSchema: Yup.object({
      items_per_page: Yup.number().min(5).max(100).required(),
    }),
    onSubmit: async (values) => {
      try {
        await settingsService.updateUserSettings(values);
        enqueueSnackbar('Preferências atualizadas com sucesso', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Erro ao atualizar preferências', { variant: 'error' });
      }
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const [systemSettings, userSettings] = await Promise.all([
          settingsService.getSystemSettings(),
          settingsService.getUserSettings(),
        ]);
        
        systemSettingsFormik.setValues(systemSettings);
        userSettingsFormik.setValues(userSettings);
      } catch (error) {
        setError('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Sistema" />
          <Tab label="Preferências" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <form onSubmit={systemSettingsFormik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome do Site"
                    name="site_name"
                    value={systemSettingsFormik.values.site_name}
                    onChange={systemSettingsFormik.handleChange}
                    error={systemSettingsFormik.touched.site_name && Boolean(systemSettingsFormik.errors.site_name)}
                    helperText={systemSettingsFormik.touched.site_name && systemSettingsFormik.errors.site_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tamanho Máximo de Upload (MB)"
                    name="max_upload_size"
                    value={systemSettingsFormik.values.max_upload_size}
                    onChange={systemSettingsFormik.handleChange}
                    error={systemSettingsFormik.touched.max_upload_size && Boolean(systemSettingsFormik.errors.max_upload_size)}
                    helperText={systemSettingsFormik.touched.max_upload_size && systemSettingsFormik.errors.max_upload_size}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tipos de Arquivo Permitidos"
                    name="allowed_file_types"
                    value={systemSettingsFormik.values.allowed_file_types}
                    onChange={systemSettingsFormik.handleChange}
                    error={systemSettingsFormik.touched.allowed_file_types && Boolean(systemSettingsFormik.errors.allowed_file_types)}
                    helperText={systemSettingsFormik.touched.allowed_file_types && systemSettingsFormik.errors.allowed_file_types}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="enable_notifications"
                        checked={systemSettingsFormik.values.enable_notifications}
                        onChange={systemSettingsFormik.handleChange}
                      />
                    }
                    label="Habilitar Notificações"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email para Notificações"
                    name="notification_email"
                    value={systemSettingsFormik.values.notification_email}
                    onChange={systemSettingsFormik.handleChange}
                    error={systemSettingsFormik.touched.notification_email && Boolean(systemSettingsFormik.errors.notification_email)}
                    helperText={systemSettingsFormik.touched.notification_email && systemSettingsFormik.errors.notification_email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Salvar Configurações do Sistema
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}

          {activeTab === 1 && (
            <form onSubmit={userSettingsFormik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Visualização Padrão"
                    name="default_view"
                    value={userSettingsFormik.values.default_view}
                    onChange={userSettingsFormik.handleChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="list">Lista</option>
                    <option value="grid">Grade</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Itens por Página"
                    name="items_per_page"
                    value={userSettingsFormik.values.items_per_page}
                    onChange={userSettingsFormik.handleChange}
                    error={userSettingsFormik.touched.items_per_page && Boolean(userSettingsFormik.errors.items_per_page)}
                    helperText={userSettingsFormik.touched.items_per_page && userSettingsFormik.errors.items_per_page}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="enable_email_notifications"
                        checked={userSettingsFormik.values.enable_email_notifications}
                        onChange={userSettingsFormik.handleChange}
                      />
                    }
                    label="Receber Notificações por Email"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Tema"
                    name="theme"
                    value={userSettingsFormik.values.theme}
                    onChange={userSettingsFormik.handleChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Salvar Preferências
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings; 