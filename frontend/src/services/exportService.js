import axiosInstance from './axiosConfig';

const exportService = {
  exportRecords: async (params) => {
    const response = await axiosInstance.post('/records/export/', params);
    return response.data;
  },

  downloadExport: async (fileId) => {
    const response = await axiosInstance.get(`/files/${fileId}/download/`, {
      responseType: 'blob'
    });
    
    // Criar URL do blob e iniciar download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', response.headers['content-disposition'].split('filename=')[1]);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default exportService; 