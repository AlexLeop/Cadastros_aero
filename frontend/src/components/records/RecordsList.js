import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Tooltip,
    TextField,
    MenuItem,
    Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as ValidateIcon,
    FileDownload as ExportIcon
} from '@mui/icons-material';
import { DateRangePicker } from '@mui/lab';
import { fetchRecords, setFilters } from '../../features/records/recordsSlice';
import recordsService from '../../services/recordsService';
import { useNotification } from '../../hooks/useNotification';

const RecordsList = () => {
    const dispatch = useDispatch();
    const { showNotification } = useNotification();
    const { items, total, loading, filters } = useSelector(state => state.records);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        loadRecords();
    }, [page, pageSize, filters]);

    const loadRecords = () => {
        dispatch(fetchRecords({
            page: page + 1,
            page_size: pageSize,
            ...filters
        }));
    };

    const handleFilterChange = (field, value) => {
        dispatch(setFilters({ [field]: value }));
    };

    const handleExport = async () => {
        try {
            await recordsService.exportRecords(filters);
            showNotification('Exportação iniciada com sucesso', 'success');
        } catch (error) {
            showNotification('Erro ao iniciar exportação', 'error');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'status', headerName: 'Status', width: 130 },
        {
            field: 'data',
            headerName: 'Dados',
            flex: 1,
            renderCell: (params) => (
                <Typography noWrap>
                    {JSON.stringify(params.value)}
                </Typography>
            )
        },
        {
            field: 'created_at',
            headerName: 'Data de Criação',
            width: 180,
            valueFormatter: (params) => new Date(params.value).toLocaleString()
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEdit(params.row)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Validar">
                        <IconButton size="small" onClick={() => handleValidate(params.row.id)}>
                            <ValidateIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton size="small" onClick={() => handleDelete(params.row.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Card>
            <CardContent>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Status"
                            select
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="pending">Pendente</MenuItem>
                            <MenuItem value="validated">Validado</MenuItem>
                            <MenuItem value="error">Erro</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <DateRangePicker
                            startText="Data inicial"
                            endText="Data final"
                            value={filters.dateRange}
                            onChange={(newValue) => handleFilterChange('dateRange', newValue)}
                            renderInput={(startProps, endProps) => (
                                <>
                                    <TextField {...startProps} />
                                    <Box sx={{ mx: 2 }}> até </Box>
                                    <TextField {...endProps} />
                                </>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Buscar"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={items}
                        columns={columns}
                        pageSize={pageSize}
                        rowCount={total}
                        loading={loading}
                        paginationMode="server"
                        page={page}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        disableSelectionOnClick
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default RecordsList; 