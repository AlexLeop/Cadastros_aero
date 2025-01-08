import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    InsertDriveFile as FileIcon,
    Check as CheckIcon,
    Error as ErrorIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNotification } from '../../hooks/useNotification';
import filesService from '../../services/filesService';

const FileUpload = () => {
    const { showNotification } = useNotification();
    const [files, setFiles] = useState([]);

    const onDrop = useCallback(async (acceptedFiles) => {
        const newFiles = acceptedFiles.map(file => ({
            file,
            progress: 0,
            status: 'pending'
        }));
        
        setFiles(prev => [...prev, ...newFiles]);

        for (const fileData of newFiles) {
            try {
                const formData = new FormData();
                formData.append('file', fileData.file);

                await filesService.uploadFile(formData, {
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        
                        setFiles(prev => prev.map(f => 
                            f.file === fileData.file
                                ? { ...f, progress }
                                : f
                        ));
                    }
                });

                setFiles(prev => prev.map(f => 
                    f.file === fileData.file
                        ? { ...f, status: 'success' }
                        : f
                ));

                showNotification('Arquivo enviado com sucesso', 'success');
            } catch (error) {
                setFiles(prev => prev.map(f => 
                    f.file === fileData.file
                        ? { ...f, status: 'error' }
                        : f
                ));
                
                showNotification(
                    `Erro ao enviar arquivo: ${error.response?.data?.message || error.message}`,
                    'error'
                );
            }
        }
    }, [showNotification]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/pdf': ['.pdf']
        }
    });

    const removeFile = (fileToRemove) => {
        setFiles(prev => prev.filter(f => f.file !== fileToRemove));
    };

    return (
        <Card>
            <CardContent>
                <Box
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed',
                        borderColor: isDragActive ? 'primary.main' : 'grey.300',
                        borderRadius: 1,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        mb: 2
                    }}
                >
                    <input {...getInputProps()} />
                    <UploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                        {isDragActive
                            ? 'Solte os arquivos aqui'
                            : 'Arraste arquivos ou clique para selecionar'
                        }
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Suporta arquivos CSV, Excel e PDF
                    </Typography>
                </Box>

                {files.length > 0 && (
                    <List>
                        {files.map((fileData, index) => (
                            <ListItem
                                key={index}
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        onClick={() => removeFile(fileData.file)}
                                        disabled={fileData.status === 'uploading'}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemIcon>
                                    {fileData.status === 'success' ? (
                                        <CheckIcon color="success" />
                                    ) : fileData.status === 'error' ? (
                                        <ErrorIcon color="error" />
                                    ) : (
                                        <FileIcon />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={fileData.file.name}
                                    secondary={
                                        fileData.status === 'pending' ? (
                                            <LinearProgress
                                                variant="determinate"
                                                value={fileData.progress}
                                            />
                                        ) : fileData.status === 'error' ? (
                                            'Erro no upload'
                                        ) : (
                                            'Upload concluído'
                                        )
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default FileUpload; 