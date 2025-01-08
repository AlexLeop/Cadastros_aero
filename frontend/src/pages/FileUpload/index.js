import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = (acceptedFiles) => {
    setFiles((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => ({
        file,
        status: 'pending',
        progress: 0,
      })),
    ]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
  });

  const uploadFiles = async () => {
    setUploading(true);
    
    for (let fileItem of files) {
      if (fileItem.status === 'success') continue;

      const formData = new FormData();
      formData.append('file', fileItem.file);
      formData.append('original_name', fileItem.file.name);
      formData.append('file_type', fileItem.file.type);

      try {
        await axios.post('/api/files/', formData, {
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setFiles((prev) =>
              prev.map((f) =>
                f.file === fileItem.file ? { ...f, progress } : f
              )
            );
          },
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.file === fileItem.file ? { ...f, status: 'success' } : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === fileItem.file ? { ...f, status: 'error' } : f
          )
        );
      }
    }

    setUploading(false);
  };

  const removeFile = (fileToRemove) => {
    setFiles((prev) => prev.filter((f) => f.file !== fileToRemove.file));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload de Arquivos
      </Typography>

      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: isDragActive ? '#f0f7ff' : 'white',
          border: '2px dashed #ccc',
          cursor: 'pointer',
          mb: 3,
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography>
          {isDragActive
            ? 'Solte os arquivos aqui...'
            : 'Arraste e solte arquivos aqui, ou clique para selecionar'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Arquivos suportados: PDF, XLS, XLSX, CSV
        </Typography>
      </Paper>

      {files.length > 0 && (
        <List>
          {files.map((fileItem) => (
            <ListItem
              key={fileItem.file.name}
              secondaryAction={
                <IconButton edge="end" onClick={() => removeFile(fileItem)}>
                  <CloseIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                {fileItem.status === 'success' ? (
                  <CheckIcon color="success" />
                ) : fileItem.status === 'error' ? (
                  <ErrorIcon color="error" />
                ) : (
                  <UploadIcon color="primary" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={fileItem.file.name}
                secondary={
                  <LinearProgress
                    variant="determinate"
                    value={fileItem.progress}
                    sx={{ mt: 1 }}
                  />
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={uploadFiles}
            disabled={uploading}
          >
            {uploading ? 'Enviando...' : 'Enviar Arquivos'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload; 