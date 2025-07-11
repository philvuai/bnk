import { AIAnalysisService } from './dist/services/AIAnalysisService.js';

// Test the AI analysis service with sample PDF text
const samplePDFText = `E X A M P L E   B A N K   P L  C  S t a t e m e n t   P e r i o d :   0 1 / 0 6 / 2 0 2 5   t o   3 0 / 0 6 / 2 0 2 5 S t a t e m e n t   D a t e :  0 3 / 0 7 / 2 0 2 5 A c c o u n t   H o l d e r M

0 3 / 0 6 / 2 0 2 5   S A L A R Y   P A Y M E N T   A B C   C O M P A N Y   L T D   £ 2 , 5 0 0 . 0 0

0 5 / 0 6 / 2 0 2 5   O F F I C E   S U P P L I E S   L T D   £ 4 5 . 9 9

0 7 / 0 6 / 2 0 2 5   S O F T W A R E   L I C E N S E   £ 2 9 . 9 9

1 0 / 0 6 / 2 0 2 5   T R A V E L   E X P E N S E   £ 1 2 5 . 5 0`;

async function testAnalysis() {
    console.log('Testing AI Analysis Service...');
    
    const service = new AIAnalysisService();
    
    try {
        const result = await service.analyzeDocument(samplePDFText);
        
        console.log('Analysis Result:');
        console.log(JSON.stringify(result, null, 2));
        
        // Check the individual transactions
        result.transactions.forEach((transaction, index) => {
            console.log(`\nTransaction ${index + 1}:`);
            console.log(`  Date: ${transaction.date}`);
            console.log(`  Description: ${transaction.description}`);
            console.log(`  Amount: £${transaction.amount}`);
            console.log(`  Category: ${transaction.category}`);
            console.log(`  Confidence: ${transaction.confidence}%`);
        });
        
    } catch (error) {
        console.error('Error during analysis:', error);
    }
}

testAnalysis();
