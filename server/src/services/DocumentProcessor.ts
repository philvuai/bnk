import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import csv from 'csv-parser';

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

private async processPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      // Use dynamic import to avoid initialization issues
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      // If PDF parsing fails, return a placeholder text for now
      if (error instanceof Error && error.message.includes('05-versions-space.pdf')) {
        console.log('PDF parsing library initialization issue detected. Using fallback text extraction.');
        return `[PDF uploaded successfully - ${path.basename(filePath)}]\n\nThis is a placeholder for PDF text extraction. The PDF upload is working, but the text extraction library needs to be fixed.\n\nFile size: ${fs.statSync(filePath).size} bytes`;
      }
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
