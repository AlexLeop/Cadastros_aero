import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import recordsService from '../../services/recordsService';
import { useSnackbar } from 'notistack';

const RecordDialog = ({ open, onClose, record, onSave }) => {
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      ...record?.data,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({}), // Adicione validações específicas conforme necessário
    onSubmit: async (values) => {
      try {
        await recordsService.updateRecord(record.id, { data: values });
        enqueueSnackbar('Registro atualizado com sucesso', { variant: 'success' });
        onSave();
        onClose();
      } catch (error) {
        enqueueSnackbar('Erro ao atualizar registro', { variant: 'error' });
      }
    },
  });

  if (!record) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Registro</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.entries(record.data).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key}
                  name={key}
                  value={formik.values[key] || ''}
                  onChange={formik.handleChange}
                  error={formik.touched[key] && Boolean(formik.errors[key])}
                  helperText={formik.touched[key] && formik.errors[key]}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RecordDialog; 