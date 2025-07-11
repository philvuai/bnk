import React, { useEffect } from 'react';
import { AnalysisResult } from '../types/analysis';

interface DebugDashboardProps {
  analysisResult: AnalysisResult;
}

export const DebugDashboard: React.FC<DebugDashboardProps> = ({ analysisResult }) => {
  useEffect(() => {
    console.log('=== ANALYSIS RESULT DEBUG ===');
    console.log('Full analysis result:', analysisResult);
    console.log('Transactions:', analysisResult.transactions);
    console.log('Summary:', analysisResult.summary);
    
    if (analysisResult.transactions && analysisResult.transactions.length > 0) {
      console.log('First transaction:', analysisResult.transactions[0]);
      console.log('First transaction amount:', analysisResult.transactions[0].amount);
      console.log('First transaction confidence:', analysisResult.transactions[0].confidence);
      console.log('Amount type:', typeof analysisResult.transactions[0].amount);
      console.log('Confidence type:', typeof analysisResult.transactions[0].confidence);
    }
    
    console.log('Total amount:', analysisResult.summary.totalAmount);
    console.log('Total amount type:', typeof analysisResult.summary.totalAmount);
    console.log('=== END DEBUG ===');
  }, [analysisResult]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px 0' }}>
      <h3>Debug Info</h3>
      <p>Total Transactions: {analysisResult.summary.totalTransactions}</p>
      <p>Total Amount: {analysisResult.summary.totalAmount}</p>
      <p>First Transaction Amount: {analysisResult.transactions[0]?.amount}</p>
      <p>First Transaction Confidence: {analysisResult.transactions[0]?.confidence}</p>
      <p>First Transaction: {JSON.stringify(analysisResult.transactions[0], null, 2)}</p>
    </div>
  );
};
