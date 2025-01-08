import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recordsService from '../../services/recordsService';

export const fetchRecords = createAsyncThunk(
    'records/fetchRecords',
    async (params) => {
        const response = await recordsService.getRecords(params);
        return response;
    }
);

export const searchRecords = createAsyncThunk(
    'records/searchRecords',
    async ({ query, filters }) => {
        const response = await recordsService.searchRecords(query, filters);
        return response;
    }
);

export const validateRecord = createAsyncThunk(
    'records/validateRecord',
    async (id) => {
        const response = await recordsService.validateRecord(id);
        return response;
    }
);

const recordsSlice = createSlice({
    name: 'records',
    initialState: {
        items: [],
        total: 0,
        loading: false,
        error: null,
        selectedRecord: null,
        filters: {
            status: null,
            dateRange: null,
            search: ''
        },
        statistics: null
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                status: null,
                dateRange: null,
                search: ''
            };
        },
        setSelectedRecord: (state, action) => {
            state.selectedRecord = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecords.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecords.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.results;
                state.total = action.payload.count;
            })
            .addCase(fetchRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(searchRecords.fulfilled, (state, action) => {
                state.items = action.payload.results;
                state.total = action.payload.total;
            })
            .addCase(validateRecord.fulfilled, (state, action) => {
                const index = state.items.findIndex(
                    item => item.id === action.payload.id
                );
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    }
});

export const { setFilters, clearFilters, setSelectedRecord } = recordsSlice.actions;
export default recordsSlice.reducer; 