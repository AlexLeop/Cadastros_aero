import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Grid,
    Chip,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as ValidateIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNotification } from '../../hooks/useNotification';
import recordsService from '../../services/recordsService';
import { validateRecord } from '../../features/records/recordsSlice';

const RecordDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showNotification } = useNotification();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecord();
    }, [id]);

    const loadRecord = async () => {
        try {
            const data = await recordsService.getRecord(id);
            setRecord(data);
        } catch (error) {
            showNotification('Erro ao carregar registro', 'error');
            navigate('/records');
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        try {
            await dispatch(validateRecord(id)).unwrap();
            showNotification('Registro validado com sucesso', 'success');
            loadRecord();
        } catch (error) {
            showNotification('Erro ao validar registro', 'error');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            try {
                await recordsService.deleteRecord(id);
                showNotification('Registro excluído com sucesso', 'success');
                navigate('/records');
            } catch (error) {
                showNotification('Erro ao excluir registro', 'error');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" component="h2">
                                Registro #{record.id}
                            </Typography>
                            <Chip
                                label={record.status}
                                color={
                                    record.status === 'validated' ? 'success' :
                                    record.status === 'error' ? 'error' : 'default'
                                }
                                sx={{ ml: 2 }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Arquivo
                        </Typography>
                        <Typography variant="body1">
                            {record.file}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Linha
                        </Typography>
                        <Typography variant="body1">
                            {record.row_number}
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="textSecondary">
                            Dados
                        </Typography>
                        <Box
                            component="pre"
                            sx={{
                                mt: 1,
                                p: 2,
                                bgcolor: 'grey.100',
                                borderRadius: 1,
                                overflow: 'auto'
                            }}
                        >
                            {JSON.stringify(record.data, null, 2)}
                        </Box>
                    </Grid>

                    {record.error_message && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="error">
                                Erro
                            </Typography>
                            <Typography variant="body2" color="error">
                                {record.error_message}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </CardContent>

            <CardActions>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/records')}
                >
                    Voltar
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    startIcon={<ValidateIcon />}
                    onClick={handleValidate}
                    disabled={record.status === 'validated'}
                >
                    Validar
                </Button>
                <Button
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/records/${id}/edit`)}
                >
                    Editar
                </Button>
                <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={handleDelete}
                >
                    Excluir
                </Button>
            </CardActions>
        </Card>
    );
};

export default RecordDetails; 