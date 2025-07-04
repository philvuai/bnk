import { OpenAI } from 'openai';

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

export class AIAnalysisService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeDocument(extractedText: string): Promise<AnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(extractedText);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analysis expert specializing in UK business expense categorization. Analyze bank statements and categorize transactions according to UK business expense categories.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No analysis result received from AI');
      }

      return this.parseAnalysisResult(analysisText);
    } catch (error) {
      console.error('AI analysis error:', error);
      throw new Error(`Failed to analyze document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildAnalysisPrompt(extractedText: string): string {
    return `
Please analyze this bank statement text and categorize each transaction according to UK business expense categories.

Bank Statement Text:
${extractedText}

Please identify and categorize each transaction using these UK business expense categories:
- Office costs (rent, utilities, supplies)
- Travel costs (transport, accommodation, meals while traveling)
- Clothing expenses (uniforms, protective clothing)
- Staff costs (salaries, benefits, training)
- Things you resell (stock, materials)
- Legal and financial costs (legal fees, accounting, insurance)
- Marketing and entertainment (advertising, client entertainment)
- Equipment and software (computers, software licenses, tools)
- Other expenses (miscellaneous business costs)

For each transaction, provide:
1. Date (if available)
2. Description
3. Amount (negative for expenses, positive for income)
4. Category
5. Subcategory (if applicable)
6. Confidence level (0-100)

Return the results in this JSON format:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Transaction description",
      "amount": -50.00,
      "category": "Office costs",
      "subcategory": "Supplies",
      "confidence": 95
    }
  ]
}

Only return the JSON, no additional text.
`;
  }

  private parseAnalysisResult(analysisText: string): AnalysisResult {
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in analysis result');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const transactions: Transaction[] = parsed.transactions || [];

      // Calculate summary statistics
      const totalTransactions = transactions.length;
      const categorizedTransactions = transactions.filter(t => t.category && t.category !== 'Unknown').length;
      
      const categoryBreakdown: Record<string, number> = {};
      const categoryAmounts: Record<string, number> = {};
      let totalAmount = 0;

      transactions.forEach(transaction => {
        const category = transaction.category || 'Unknown';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
        categoryAmounts[category] = (categoryAmounts[category] || 0) + Math.abs(transaction.amount);
        totalAmount += Math.abs(transaction.amount);
      });

      return {
        transactions,
        summary: {
          totalTransactions,
          categorizedTransactions,
          categoryBreakdown,
          totalAmount,
          categoryAmounts
        }
      };
    } catch (error) {
      console.error('Error parsing analysis result:', error);
      throw new Error('Failed to parse AI analysis result');
    }
  }

  // Fallback analysis for when AI is not available
  async fallbackAnalysis(extractedText: string): Promise<AnalysisResult> {
    // Simple pattern-based categorization as fallback
    const lines = extractedText.split('\n');
    const transactions: Transaction[] = [];

    lines.forEach((line, index) => {
      // Simple pattern matching for common bank statement formats
      const amountMatch = line.match(/[-+]?[\d,]+\.?\d*/);
      const dateMatch = line.match(/\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/);
      
      if (amountMatch && dateMatch) {
        const amount = parseFloat(amountMatch[0].replace(',', ''));
        const description = line.replace(amountMatch[0], '').replace(dateMatch[0], '').trim();
        
        transactions.push({
          date: dateMatch[0],
          description,
          amount: amount,
          category: this.guessCategory(description),
          confidence: 50 // Lower confidence for fallback
        });
      }
    });

    // Calculate summary
    const totalTransactions = transactions.length;
    const categorizedTransactions = transactions.filter(t => t.category !== 'Unknown').length;
    const categoryBreakdown: Record<string, number> = {};
    const categoryAmounts: Record<string, number> = {};
    let totalAmount = 0;

    transactions.forEach(transaction => {
      const category = transaction.category;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
      categoryAmounts[category] = (categoryAmounts[category] || 0) + Math.abs(transaction.amount);
      totalAmount += Math.abs(transaction.amount);
    });

    return {
      transactions,
      summary: {
        totalTransactions,
        categorizedTransactions,
        categoryBreakdown,
        totalAmount,
        categoryAmounts
      }
    };
  }

  private guessCategory(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('office') || desc.includes('supplies') || desc.includes('stationery')) {
      return 'Office costs';
    }
    if (desc.includes('travel') || desc.includes('hotel') || desc.includes('transport')) {
      return 'Travel costs';
    }
    if (desc.includes('software') || desc.includes('computer') || desc.includes('equipment')) {
      return 'Equipment and software';
    }
    if (desc.includes('marketing') || desc.includes('advertising') || desc.includes('entertainment')) {
      return 'Marketing and entertainment';
    }
    if (desc.includes('legal') || desc.includes('accountant') || desc.includes('insurance')) {
      return 'Legal and financial costs';
    }
    if (desc.includes('salary') || desc.includes('staff') || desc.includes('employee')) {
      return 'Staff costs';
    }
    
    return 'Unknown';
  }
}
