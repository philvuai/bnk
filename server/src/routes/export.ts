import express from 'express';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Export analysis results to Excel
router.get('/excel/:fileId', async (req: any, res: any) => {
  try {
    const { fileId } = req.params;
    const resultPath = path.join(process.cwd(), 'uploads', `${fileId}.analysis.json`);

    if (!fs.existsSync(resultPath)) {
      return res.status(404).json({ error: 'Analysis result not found' });
    }

    const analysisResult = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));

    // Create workbook
    const workbook = xlsx.utils.book_new();

    // Create transactions worksheet
    const transactionsData = analysisResult.transactions.map((transaction: any) => ({
      Date: transaction.date,
      Description: transaction.description,
      Amount: transaction.amount,
      Category: transaction.category,
      Subcategory: transaction.subcategory || '',
      Confidence: transaction.confidence
    }));

    const transactionsWorksheet = xlsx.utils.json_to_sheet(transactionsData);
    xlsx.utils.book_append_sheet(workbook, transactionsWorksheet, 'Transactions');

    // Create summary worksheet
    const summaryData = [
      { Metric: 'Total Transactions', Value: analysisResult.summary.totalTransactions },
      { Metric: 'Categorized Transactions', Value: analysisResult.summary.categorizedTransactions },
      { Metric: 'Total Amount', Value: analysisResult.summary.totalAmount },
      { Metric: '', Value: '' }, // Empty row
      { Metric: 'Category Breakdown', Value: '' },
      ...Object.entries(analysisResult.summary.categoryBreakdown).map(([category, count]) => ({
        Metric: category,
        Value: count
      })),
      { Metric: '', Value: '' }, // Empty row
      { Metric: 'Category Amounts', Value: '' },
      ...Object.entries(analysisResult.summary.categoryAmounts).map(([category, amount]) => ({
        Metric: category,
        Value: amount
      }))
    ];

    const summaryWorksheet = xlsx.utils.json_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Create category breakdown chart data
    const categoryChartData = Object.entries(analysisResult.summary.categoryBreakdown).map(([category, count]) => ({
      Category: category,
      'Number of Transactions': count,
      'Total Amount': analysisResult.summary.categoryAmounts[category] || 0
    }));

    const categoryChartWorksheet = xlsx.utils.json_to_sheet(categoryChartData);
    xlsx.utils.book_append_sheet(workbook, categoryChartWorksheet, 'Category Analysis');

    // Generate Excel file
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="bank-statement-analysis-${fileId}.xlsx"`);

    res.send(excelBuffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export analysis results',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Export analysis results to CSV
router.get('/csv/:fileId', async (req: any, res: any) => {
  try {
    const { fileId } = req.params;
    const resultPath = path.join(process.cwd(), 'uploads', `${fileId}.analysis.json`);

    if (!fs.existsSync(resultPath)) {
      return res.status(404).json({ error: 'Analysis result not found' });
    }

    const analysisResult = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));

    // Create CSV content
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Subcategory', 'Confidence'];
    const csvRows = [headers.join(',')];

    analysisResult.transactions.forEach((transaction: any) => {
      const row = [
        transaction.date,
        `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes
        transaction.amount,
        transaction.category,
        transaction.subcategory || '',
        transaction.confidence
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bank-statement-analysis-${fileId}.csv"`);

    res.send(csvContent);

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ 
      error: 'Failed to export analysis results as CSV',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
