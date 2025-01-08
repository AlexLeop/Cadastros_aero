import { rest } from 'msw';

const API_URL = process.env.REACT_APP_API_URL;

export const handlers = [
    // Auth
    rest.post(`${API_URL}/auth/token/`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                access: 'mock-token',
                refresh: 'mock-refresh-token',
                user: {
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                    is_admin: false
                }
            })
        );
    }),

    // Records
    rest.get(`${API_URL}/records/`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                count: 2,
                results: [
                    {
                        id: 1,
                        file: 1,
                        row_number: 1,
                        data: { field: 'value1' },
                        status: 'pending',
                        created_at: '2024-01-01T00:00:00Z'
                    },
                    {
                        id: 2,
                        file: 1,
                        row_number: 2,
                        data: { field: 'value2' },
                        status: 'validated',
                        created_at: '2024-01-01T00:00:00Z'
                    }
                ]
            })
        );
    }),

    // Settings
    rest.get(`${API_URL}/settings/`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                max_file_size: 10,
                allowed_extensions: '.pdf,.csv,.xlsx',
                auto_validation: true,
                validation_timeout: 30,
                email_notifications: true,
                realtime_notifications: true
            })
        );
    })
]; 