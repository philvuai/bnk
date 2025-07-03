import express from 'express';
import { AIAnalysisService } from '../services/AIAnalysisService.js';
import { DocumentProcessor } from '../services/DocumentProcessor.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Analyze uploaded document
router.post('/analyze/:fileId', async (req: any, res: any) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', fileId);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file info
    const stats = fs.statSync(filePath);
    const mimeType = getMimeType(filePath);

    // Process document to extract text
    const processor = new DocumentProcessor();
    const extractedText = await processor.processDocument(filePath, mimeType);

    // Analyze with AI
    const analysisService = new AIAnalysisService();
    let analysisResult;

    try {
      analysisResult = await analysisService.analyzeDocument(extractedText);
    } catch (aiError) {
      console.warn('AI analysis failed, falling back to pattern matching:', aiError);
      analysisResult = await analysisService.fallbackAnalysis(extractedText);
    }

    // Store analysis result (in a real app, you'd store this in a database)
    const resultPath = path.join(process.cwd(), 'uploads', `${fileId}.analysis.json`);
    fs.writeFileSync(resultPath, JSON.stringify(analysisResult, null, 2));

    res.json({
      success: true,
      fileId,
      analysis: analysisResult,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get analysis result
router.get('/result/:fileId', async (req: any, res: any) => {
  try {
    const { fileId } = req.params;
    const resultPath = path.join(process.cwd(), 'uploads', `${fileId}.analysis.json`);

    if (!fs.existsSync(resultPath)) {
      return res.status(404).json({ error: 'Analysis result not found' });
    }

    const analysisResult = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
    
    res.json({
      success: true,
      fileId,
      analysis: analysisResult,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error retrieving analysis result:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve analysis result',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update transaction category (manual correction)
router.put('/transaction/:fileId/:transactionIndex', async (req: any, res: any) => {
  try {
    const { fileId, transactionIndex } = req.params;
    const { category, subcategory } = req.body;
    
    const resultPath = path.join(process.cwd(), 'uploads', `${fileId}.analysis.json`);

    if (!fs.existsSync(resultPath)) {
      return res.status(404).json({ error: 'Analysis result not found' });
    }

    const analysisResult = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
    const index = parseInt(transactionIndex);

    if (index < 0 || index >= analysisResult.transactions.length) {
      return res.status(400).json({ error: 'Invalid transaction index' });
    }

    // Update the transaction
    analysisResult.transactions[index].category = category;
    if (subcategory) {
      analysisResult.transactions[index].subcategory = subcategory;
    }

    // Recalculate summary
    const categoryBreakdown: Record<string, number> = {};
    const categoryAmounts: Record<string, number> = {};
    let totalAmount = 0;

    analysisResult.transactions.forEach((transaction: any) => {
      const cat = transaction.category || 'Unknown';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      categoryAmounts[cat] = (categoryAmounts[cat] || 0) + Math.abs(transaction.amount);
      totalAmount += Math.abs(transaction.amount);
    });

    analysisResult.summary = {
      totalTransactions: analysisResult.transactions.length,
      categorizedTransactions: analysisResult.transactions.filter((t: any) => t.category && t.category !== 'Unknown').length,
      categoryBreakdown,
      totalAmount,
      categoryAmounts
    };

    // Save updated result
    fs.writeFileSync(resultPath, JSON.stringify(analysisResult, null, 2));

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ 
      error: 'Failed to update transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to determine MIME type from file extension
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.csv': 'text/csv',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

export default router;
