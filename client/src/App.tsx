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
    console.log('=== APP.TSX DEBUG ===');
    console.log('Analysis result received:', result);
    console.log('File ID:', id);
    console.log('Type of result:', typeof result);
    console.log('Is result null?', result === null);
    console.log('Is result undefined?', result === undefined);
    console.log('=== END APP.TSX DEBUG ===');
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
          <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px 0' }}>
            <h2>App Debug Info</h2>
            <p>Analysis Result: {analysisResult ? 'EXISTS' : 'NULL'}</p>
            <p>File ID: {fileId || 'NULL'}</p>
            <button onClick={() => console.log('Current analysisResult:', analysisResult)}>Log Analysis Result</button>
          </div>
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
