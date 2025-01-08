import axiosInstance from './axiosConfig';

class SettingsService {
    async getSettings() {
        const response = await axiosInstance.get('/settings/');
        return response.data;
    }

    async updateSettings(data) {
        const response = await axiosInstance.put('/settings/', data);
        return response.data;
    }

    async resetSettings() {
        const response = await axiosInstance.post('/settings/reset/');
        return response.data;
    }
}

export default new SettingsService(); 