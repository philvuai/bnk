import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import csv from 'csv-parser';
import PDFParser from 'pdf2json';

export class DocumentProcessor {
  
  async processDocument(filePath: string, mimeType: string): Promise<string> {
    try {
      switch (mimeType) {
        case 'application/pdf':
          return await this.processPDF(filePath);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.processWord(filePath);
        
        case 'text/csv':
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return await this.processCSV(filePath);
        
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

private processPDF(filePath: string): Promise<string> {
    const pdfParser = new PDFParser();

    return new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', err => {
        console.error('PDF processing error:', err.parserError);
        reject(new Error(`Failed to process PDF: ${err.parserError}`));
      });

      pdfParser.on('pdfParser_dataReady', pdfData => {
        try {
          // Try to get raw text content first
          let extractedText = pdfParser.getRawTextContent();
          console.log(`Raw text extraction - length: ${extractedText.length} characters`);
          
          // If no raw text, try to parse the PDF data structure
          if (!extractedText || extractedText.trim().length === 0) {
            console.log('No raw text found, attempting to parse PDF data structure...');
            extractedText = this.extractTextFromPDFData(pdfData);
            console.log(`Structured text extraction - length: ${extractedText.length} characters`);
          }
          
          if (extractedText && extractedText.trim().length > 0) {
            console.log('Successfully extracted text from PDF');
            console.log('First 200 characters:', extractedText.substring(0, 200));
            resolve(extractedText);
          } else {
            console.error('No text content could be extracted from PDF');
            reject(new Error('PDF contains no extractable text content. This may be a scanned/image-based PDF that requires OCR processing.'));
          }
        } catch (error) {
          console.error('Error processing PDF data:', error);
          reject(new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      });

      console.log('Starting PDF processing for:', filePath);
      pdfParser.loadPDF(filePath);
    });
  }

  private async processWord(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  private async processCSV(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // Convert CSV data to text format
          const headers = Object.keys(results[0] || {});
          let text = headers.join('\t') + '\n';
          
          results.forEach(row => {
            const values = headers.map(header => row[header] || '');
            text += values.join('\t') + '\n';
          });
          
          resolve(text);
        })
        .on('error', reject);
    });
  }

  // Extract text from PDF data structure when getRawTextContent() fails
  private extractTextFromPDFData(pdfData: any): string {
    try {
      let extractedText = '';
      
      if (pdfData && pdfData.Pages && Array.isArray(pdfData.Pages)) {
        console.log(`PDF has ${pdfData.Pages.length} pages`);
        
        for (let pageIndex = 0; pageIndex < pdfData.Pages.length; pageIndex++) {
          const page = pdfData.Pages[pageIndex];
          console.log(`Processing page ${pageIndex + 1}`);
          
          if (page.Texts && Array.isArray(page.Texts)) {
            console.log(`Page ${pageIndex + 1} has ${page.Texts.length} text elements`);
            
            for (const textElement of page.Texts) {
              if (textElement.R && Array.isArray(textElement.R)) {
                for (const textRun of textElement.R) {
                  if (textRun.T) {
                    // Decode the text (it may be URL-encoded)
                    const decodedText = decodeURIComponent(textRun.T);
                    extractedText += decodedText + ' ';
                  }
                }
              }
            }
            extractedText += '\n'; // Add newline after each page
          }
        }
      }
      
      return extractedText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF data structure:', error);
      return '';
    }
  }

  // Generate realistic mock bank statement data for demo
  private generateMockBankStatementData(filePath: string): string {
    const fileName = path.basename(filePath);
    const fileSize = fs.statSync(filePath).size;
    
    return `ACME BUSINESS BANK
Business Current Account Statement
Account Number: 12345678
Sort Code: 20-00-00
Statement Period: 01/11/2024 to 30/11/2024

Date        Description                           Debit      Credit     Balance
01/11/2024  OPENING BALANCE                                             £2,450.00
02/11/2024  OFFICE DEPOT - SUPPLIES              £45.99                £2,404.01
03/11/2024  MICROSOFT OFFICE 365                 £29.99                £2,374.02
05/11/2024  AMAZON WEB SERVICES                  £125.50               £2,248.52
06/11/2024  TRAINLINE - LONDON                   £87.20                £2,161.32
08/11/2024  TESCO FUEL STATION                   £65.80                £2,095.52
10/11/2024  ADOBE CREATIVE SUITE                 £52.99                £2,042.53
12/11/2024  SUPPLIER PAYMENT                                £1,200.00  £3,242.53
15/11/2024  PREMIER INN - BIRMINGHAM             £89.00                £3,153.53
16/11/2024  GOOGLE WORKSPACE                     £24.99                £3,128.54
18/11/2024  STAPLES - OFFICE SUPPLIES            £78.45                £3,050.09
20/11/2024  UBER FOR BUSINESS                    £34.50                £3,015.59
22/11/2024  ZOOM PRO SUBSCRIPTION               £14.99                £3,000.60
25/11/2024  CLIENT PAYMENT                                  £850.00    £3,850.60
26/11/2024  BRITISH GAS - OFFICE                 £156.78               £3,693.82
28/11/2024  ACCOUNTANT FEES                      £200.00               £3,493.82
30/11/2024  CLOSING BALANCE                                             £3,493.82

PDF File: ${fileName}
File Size: ${fileSize} bytes
Generated for demonstration purposes`;
  }

  // Clean up uploaded file after processing
  async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}
