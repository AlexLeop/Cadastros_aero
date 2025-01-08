import authService from '../authService';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig');

describe('AuthService', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('logs in successfully', async () => {
        const mockResponse = {
            data: {
                access: 'test-token',
                refresh: 'test-refresh',
                user: {
                    id: 1,
                    name: 'Test User'
                }
            }
        };

        axiosInstance.post.mockResolvedValueOnce(mockResponse);

        const credentials = {
            email: 'test@example.com',
            password: 'password'
        };

        const response = await authService.login(credentials);

        expect(axiosInstance.post).toHaveBeenCalledWith('/auth/token/', credentials);
        expect(localStorage.getItem('token')).toBe('test-token');
        expect(localStorage.getItem('refreshToken')).toBe('test-refresh');
        expect(response).toEqual(mockResponse.data);
    });

    it('refreshes token successfully', async () => {
        localStorage.setItem('refreshToken', 'old-refresh-token');

        const mockResponse = {
            data: {
                access: 'new-token'
            }
        };

        axiosInstance.post.mockResolvedValueOnce(mockResponse);

        const response = await authService.refreshToken();

        expect(axiosInstance.post).toHaveBeenCalledWith('/auth/token/refresh/', {
            refresh: 'old-refresh-token'
        });
        expect(localStorage.getItem('token')).toBe('new-token');
        expect(response).toEqual(mockResponse.data);
    });

    it('handles logout', () => {
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('refreshToken', 'test-refresh');

        authService.logout();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
    });
}); 