export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  confidence: number;
}

export interface AnalysisResult {
  transactions: Transaction[];
  summary: {
    totalTransactions: number;
    categorizedTransactions: number;
    categoryBreakdown: Record<string, number>;
    totalAmount: number;
    categoryAmounts: Record<string, number>;
  };
}

export interface UploadResponse {
  success: boolean;
  fileId: string;
  originalName: string;
  size: number;
  extractedText: string;
  message: string;
}

export interface AnalysisResponse {
  success: boolean;
  fileId: string;
  analysis: AnalysisResult;
  processedAt: string;
}
