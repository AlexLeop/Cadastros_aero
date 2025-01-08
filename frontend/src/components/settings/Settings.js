import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Grid,
    TextField,
    Switch,
    FormControlLabel,
    Typography,
    Box,
    Button,
    CircularProgress,
    Divider,
    Alert
} from '@mui/material';
import { useNotification } from '../../hooks/useNotification';
import settingsService from '../../services/settingsService';

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await settingsService.getSettings();
            setSettings(data);
        } catch (error) {
            showNotification('Erro ao carregar configurações', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsService.updateSettings(settings);
            showNotification('Configurações salvas com sucesso', 'success');
        } catch (error) {
            showNotification('Erro ao salvar configurações', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card>
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            Configurações do Sistema
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Estas configurações afetam todo o sistema. Altere com cuidado.
                        </Alert>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Processamento de Arquivos
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Tamanho máximo de arquivo (MB)"
                            type="number"
                            value={settings.max_file_size || ''}
                            onChange={(e) => handleChange('max_file_size', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Extensões permitidas"
                            value={settings.allowed_extensions || ''}
                            onChange={(e) => handleChange('allowed_extensions', e.target.value)}
                            helperText="Separadas por vírgula (ex: .pdf, .csv, .xlsx)"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Validação de Registros
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.auto_validation || false}
                                    onChange={(e) => handleChange('auto_validation', e.target.checked)}
                                />
                            }
                            label="Validação automática"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Tempo limite de validação (segundos)"
                            type="number"
                            value={settings.validation_timeout || ''}
                            onChange={(e) => handleChange('validation_timeout', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Notificações
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.email_notifications || false}
                                    onChange={(e) => handleChange('email_notifications', e.target.checked)}
                                />
                            }
                            label="Notificações por email"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.realtime_notifications || false}
                                    onChange={(e) => handleChange('realtime_notifications', e.target.checked)}
                                />
                            }
                            label="Notificações em tempo real"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={saving}
                                startIcon={saving && <CircularProgress size={20} />}
                            >
                                {saving ? 'Salvando...' : 'Salvar Configurações'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default Settings; 