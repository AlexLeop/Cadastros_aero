import axiosInstance from './axiosConfig';

class FilesService {
    async uploadFile(formData, config = {}) {
        const response = await axiosInstance.post('/files/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            ...config
        });
        return response.data;
    }

    async getFiles(params = {}) {
        const response = await axiosInstance.get('/files/', { params });
        return response.data;
    }

    async getFile(id) {
        const response = await axiosInstance.get(`/files/${id}/`);
        return response.data;
    }

    async deleteFile(id) {
        await axiosInstance.delete(`/files/${id}/`);
    }

    async processFile(id) {
        const response = await axiosInstance.post(`/files/${id}/process/`);
        return response.data;
    }

    async getProcessingStatus(id) {
        const response = await axiosInstance.get(`/files/${id}/status/`);
        return response.data;
    }
}

export default new FilesService(); 