import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Typography, AppBar, Toolbar } from '@mui/material';
import { UploadComponent } from './components/UploadComponent';
import { Dashboard } from './components/Dashboard';
import { AnalysisResult } from './types/analysis';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult, id: string) => {
    setAnalysisResult(result);
    setFileId(id);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setFileId(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                color: 'text.primary',
                fontWeight: 700
              }}
            >
              BankStatementAI
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {!analysisResult ? (
            <UploadComponent onAnalysisComplete={handleAnalysisComplete} />
          ) : (
            <Dashboard 
              analysisResult={analysisResult}
              fileId={fileId!}
              onReset={handleReset}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
