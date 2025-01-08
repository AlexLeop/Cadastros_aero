import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Grid,
    TextField,
    CircularProgress
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';
import recordsService from '../../services/recordsService';

const validationSchema = Yup.object({
    file: Yup.number().required('Arquivo é obrigatório'),
    row_number: Yup.number().required('Número da linha é obrigatório'),
    data: Yup.object().required('Dados são obrigatórios')
});

const RecordForm = ({ record, onSubmit }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const formik = useFormik({
        initialValues: {
            file: record?.file || '',
            row_number: record?.row_number || '',
            data: record?.data || {}
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await onSubmit(values);
                showNotification('Registro salvo com sucesso', 'success');
                navigate('/records');
            } catch (error) {
                showNotification('Erro ao salvar registro', 'error');
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <Card>
            <form onSubmit={formik.handleSubmit}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                name="file"
                                label="Arquivo"
                                value={formik.values.file}
                                onChange={formik.handleChange}
                                error={formik.touched.file && Boolean(formik.errors.file)}
                                helperText={formik.touched.file && formik.errors.file}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                name="row_number"
                                label="Número da Linha"
                                type="number"
                                value={formik.values.row_number}
                                onChange={formik.handleChange}
                                error={formik.touched.row_number && Boolean(formik.errors.row_number)}
                                helperText={formik.touched.row_number && formik.errors.row_number}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                name="data"
                                label="Dados (JSON)"
                                value={JSON.stringify(formik.values.data, null, 2)}
                                onChange={(e) => {
                                    try {
                                        const parsedData = JSON.parse(e.target.value);
                                        formik.setFieldValue('data', parsedData);
                                    } catch (error) {
                                        // Ignorar erros de parse enquanto o usuário digita
                                    }
                                }}
                                error={formik.touched.data && Boolean(formik.errors.data)}
                                helperText={formik.touched.data && formik.errors.data}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/records')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={formik.isSubmitting}
                            startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : null}
                        >
                            Salvar
                        </Button>
                    </Box>
                </CardActions>
            </form>
        </Card>
    );
};

export default RecordForm; 