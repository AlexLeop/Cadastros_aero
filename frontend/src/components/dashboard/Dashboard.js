import React, { useEffect, useState } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import recordsService from '../../services/recordsService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const data = await recordsService.getStatistics();
            setStatistics(data);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    const statusData = [
        { name: 'Pendentes', value: statistics.by_status.pending || 0 },
        { name: 'Validados', value: statistics.by_status.validated || 0 },
        { name: 'Com erro', value: statistics.by_status.error || 0 }
    ];

    const timelineData = statistics.by_date.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        total: item.count
    }));

    return (
        <Grid container spacing={3}>
            {/* Cards de resumo */}
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Total de Registros
                        </Typography>
                        <Typography variant="h4">
                            {statistics.total_records}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Taxa de Validação
                        </Typography>
                        <Typography variant="h4">
                            {Math.round((statistics.by_status.validated || 0) / statistics.total_records * 100)}%
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Taxa de Erro
                        </Typography>
                        <Typography variant="h4" color="error">
                            {Math.round((statistics.by_status.error || 0) / statistics.total_records * 100)}%
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Gráficos */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Distribuição por Status
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Registros por Data
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Dashboard; 