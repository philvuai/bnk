import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography, Container, CircularProgress, Alert } from '@mui/material';
import { CloudUpload as UploadIcon, Security as SecurityIcon, Speed as SpeedIcon, Analytics as AnalyticsIcon } from '@mui/icons-material';
import axios from 'axios';
import { AnalysisResponse, UploadResponse } from '../types/analysis';

interface UploadComponentProps {
  onAnalysisComplete: (result: any, id: string) => void;
}

export const UploadComponent: React.FC<UploadComponentProps> = ({ onAnalysisComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress('Uploading file...');
    
    try {
      const formData = new FormData();
      formData.append('document', acceptedFiles[0]);

      const uploadResponse = await axios.post<UploadResponse>('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadProgress('Analyzing document with AI...');
      const { fileId } = uploadResponse.data;
      
      const analysisResponse = await axios.post<AnalysisResponse>(`/api/analysis/analyze/${fileId}`);
      onAnalysisComplete(analysisResponse.data.analysis, fileId);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'An error occurred while processing your file');
    } finally {
      setIsLoading(false);
      setUploadProgress('');
    }
  }, [onAnalysisComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    disabled: isLoading
  });

  return (
    <Container maxWidth="md">
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          AI-Powered Bank Statement Analysis
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Automatically categorize your business transactions with advanced AI
        </Typography>
        
        {/* Feature Cards */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 6, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
            <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>Secure</Typography>
            <Typography variant="body2" color="text.secondary">
              Bank-grade security with encrypted file processing
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
            <SpeedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>Fast</Typography>
            <Typography variant="body2" color="text.secondary">
              Process hundreds of transactions in seconds
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
            <AnalyticsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>Accurate</Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered categorization for UK business expenses
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Upload Section */}
      <Box sx={{ mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {isLoading ? (
          <Box sx={{ 
            p: 6, 
            textAlign: 'center', 
            bgcolor: 'background.paper', 
            borderRadius: 3,
            boxShadow: 2
          }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {uploadProgress}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your document...
            </Typography>
          </Box>
        ) : (
          <Box
            {...getRootProps()}
            sx={{
              p: 6,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              borderRadius: 3,
              textAlign: 'center',
              bgcolor: 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              boxShadow: 2,
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 4
              }
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            {isDragActive ? (
              <Typography variant="h5" color="primary" gutterBottom>
                Drop your file here
              </Typography>
            ) : (
              <>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Upload Your Bank Statement
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                  Drag & drop your file here, or click to browse
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<UploadIcon />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Choose File
                </Button>
              </>
            )}
            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
              Supports PDF, Word documents, CSV, and Excel files (max 10MB)
            </Typography>
          </Box>
        )}
      </Box>

      {/* Instructions */}
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          How it works
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            1. Upload your bank statement
          </Typography>
          <Typography variant="body2" color="text.secondary">→</Typography>
          <Typography variant="body2" color="text.secondary">
            2. AI analyzes and categorizes transactions
          </Typography>
          <Typography variant="body2" color="text.secondary">→</Typography>
          <Typography variant="body2" color="text.secondary">
            3. Review results and export to Excel
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

