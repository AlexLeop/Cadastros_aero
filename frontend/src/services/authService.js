import axiosInstance from './axiosConfig';

class AuthService {
    async login(credentials) {
        const response = await axiosInstance.post('/auth/token/', credentials);
        const { access, refresh } = response.data;
        
        localStorage.setItem('token', access);
        localStorage.setItem('refreshToken', refresh);
        
        return response.data;
    }

    async refreshToken() {
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) throw new Error('No refresh token available');

        const response = await axiosInstance.post('/auth/token/refresh/', {
            refresh
        });
        
        localStorage.setItem('token', response.data.access);
        return response.data;
    }

    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }

    async getProfile() {
        const response = await axiosInstance.get('/auth/profile/');
        return response.data;
    }

    async updateProfile(data) {
        const response = await axiosInstance.patch('/auth/profile/', data);
        return response.data;
    }

    async changePassword(data) {
        await axiosInstance.post('/auth/change-password/', data);
    }
}

export default new AuthService(); 