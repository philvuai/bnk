import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import {
  GetApp as ExportIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { AnalysisResult } from '../types/analysis';

// Configure API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

interface DashboardProps {
  analysisResult: AnalysisResult;
  fileId: string;
  onReset: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

export const Dashboard: React.FC<DashboardProps> = ({ analysisResult, fileId, onReset }) => {
  const handleExportExcel = () => {
    window.open(`${API_BASE_URL}/api/export/excel/${fileId}`, '_blank');
  };

  const handleExportCSV = () => {
    window.open(`${API_BASE_URL}/api/export/csv/${fileId}`, '_blank');
  };

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'description', headerName: 'Description', width: 300, flex: 1 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      type: 'number',
      valueFormatter: (params: any) => {
        // params is the raw value, not an object with .value property
        const value = params as number;
        return `£${(value || 0).toFixed(2)}`;
      }
    },
    { field: 'category', headerName: 'Category', width: 180 },
    { field: 'subcategory', headerName: 'Subcategory', width: 150 },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 100,
      type: 'number',
      valueFormatter: (params: any) => {
        // params is the raw value, not an object with .value property
        const value = params as number;
        return `${value || 0}%`;
      }
    }
  ];

  const rows = analysisResult.transactions.map((transaction, index) => ({
    id: index,
    ...transaction
  }));

  const pieData = Object.entries(analysisResult.summary.categoryBreakdown).map(([category, count]) => ({
    name: category,
    value: count
  }));

  const barData = Object.entries(analysisResult.summary.categoryAmounts).map(([category, amount]) => ({
    category,
    amount
  }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analysis Results
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onReset}
          >
            Analyze New File
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h4" component="div">
                {analysisResult.summary.totalTransactions}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categorized
              </Typography>
              <Typography variant="h4" component="div">
                {analysisResult.summary.categorizedTransactions}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h4" component="div">
                £{analysisResult.summary.totalAmount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categories
              </Typography>
              <Typography variant="h4" component="div">
                {Object.keys(analysisResult.summary.categoryBreakdown).length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Amount by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Amount']} />
                <Bar dataKey="amount" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>

      {/* Transactions Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Transaction Details
        </Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </Box>
  );
};
