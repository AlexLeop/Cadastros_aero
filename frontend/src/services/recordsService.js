import axiosInstance from './axiosConfig';
import { saveAs } from 'file-saver';

class RecordsService {
    async getRecords(params = {}) {
        const response = await axiosInstance.get('/records/', { params });
        return response.data;
    }

    async getRecord(id) {
        const response = await axiosInstance.get(`/records/${id}/`);
        return response.data;
    }

    async createRecord(data) {
        const response = await axiosInstance.post('/records/', data);
        return response.data;
    }

    async updateRecord(id, data) {
        const response = await axiosInstance.patch(`/records/${id}/`, data);
        return response.data;
    }

    async deleteRecord(id) {
        await axiosInstance.delete(`/records/${id}/`);
    }

    async validateRecord(id) {
        const response = await axiosInstance.post(`/records/${id}/validate/`);
        return response.data;
    }

    async exportRecords(filters, format = 'xlsx') {
        const response = await axiosInstance.post(
            '/records/export/',
            { ...filters, format },
            { responseType: 'blob' }
        );
        
        const filename = `records_export_${new Date().toISOString()}.${format}`;
        saveAs(response.data, filename);
    }

    async searchRecords(query, filters = {}) {
        const response = await axiosInstance.post('/records/search/', {
            query,
            filters
        });
        return response.data;
    }

    async getStatistics() {
        const response = await axiosInstance.get('/records/statistics/');
        return response.data;
    }
}

export default new RecordsService(); 