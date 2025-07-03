# Bank Statement AI Analyzer

🤖 A secure AI-powered web application for analyzing bank statements and categorizing transactions for UK businesses. Features a modern, clean interface inspired by Airbnb and Apple design principles.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)

## Features

- **File Upload**: Support for PDF, Word documents (DOC/DOCX), and CSV files
- **AI Analysis**: Uses OpenAI GPT to categorize transactions into UK business expense categories
- **Interactive Dashboard**: Clean, modern interface with charts and data visualization
- **Export Functionality**: Export results to Excel or CSV format
- **Security**: Built with security best practices including file validation, rate limiting, and CORS protection

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- OpenAI API integration
- File processing (PDF, Word, CSV)
- Security middleware (Helmet, CORS, Rate Limiting)

### Frontend
- React with TypeScript
- Material-UI (MUI) for modern UI components
- React Dropzone for file uploads
- Recharts for data visualization
- Axios for API communication

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Git (for cloning and deployment)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone git@github.com:philvuai/bnk.git
cd bnk

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Create a `.env` file in the server directory:

```bash
cd ../server
cp .env.example .env
```

Edit the `.env` file and add your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Security
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=12

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

### 3. Build and Start the Application

#### Development Mode

Terminal 1 (Server):
```bash
cd server
npm run dev
```

Terminal 2 (Client):
```bash
cd client
npm start
```

#### Production Mode

```bash
# Build the server
cd server
npm run build
npm start

# Build the client
cd ../client
npm run build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. **Upload a Bank Statement**: Drag and drop or click to select a PDF, Word document, or CSV file containing your bank statement
2. **AI Analysis**: The system will automatically process the document and categorize transactions using AI
3. **View Results**: Review the analysis results in the interactive dashboard with:
   - Summary statistics
   - Category breakdown charts
   - Detailed transaction table
4. **Export Data**: Download the results as Excel or CSV files for further processing

## UK Business Expense Categories

The AI categorizes transactions into these UK business expense categories:

- **Office costs** (rent, utilities, supplies)
- **Travel costs** (transport, accommodation, meals while traveling)  
- **Clothing expenses** (uniforms, protective clothing)
- **Staff costs** (salaries, benefits, training)
- **Things you resell** (stock, materials)
- **Legal and financial costs** (legal fees, accounting, insurance)
- **Marketing and entertainment** (advertising, client entertainment)
- **Equipment and software** (computers, software licenses, tools)
- **Other expenses** (miscellaneous business costs)

## Security Features

- File type validation and size limits
- Rate limiting to prevent abuse
- CORS protection
- Secure file handling with cleanup
- Input validation and sanitization
- Error handling without exposing sensitive information

## API Endpoints

### Upload
- `POST /api/upload` - Upload and process document

### Analysis  
- `POST /api/analysis/analyze/:fileId` - Analyze processed document
- `GET /api/analysis/result/:fileId` - Get analysis results
- `PUT /api/analysis/transaction/:fileId/:transactionIndex` - Update transaction category

### Export
- `GET /api/export/excel/:fileId` - Export to Excel
- `GET /api/export/csv/:fileId` - Export to CSV

### Health
- `GET /api/health` - Health check endpoint

## File Support

- **PDF**: Bank statements in PDF format
- **Word**: DOC and DOCX documents
- **CSV**: Comma-separated value files with transaction data
- **Excel**: XLS and XLSX spreadsheets

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Deployment

### Environment Variables
Make sure to set up the following environment variables in your deployment:

```env
OPENAI_API_KEY=your-openai-api-key
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### Platform Deployment
- **Vercel**: Deploy the client with `vercel --prod`
- **Railway**: Deploy the server with Railway CLI
- **Heroku**: Use `heroku create` and push to deploy
- **Netlify**: Connect your GitHub repo for automatic deployments

## License

This project is licensed under the ISC License.

## Support

For support or questions, please create an issue in the repository.
