# 🚀 Deployment Guide

This guide covers various deployment options for the Bank Statement AI Analyzer.

## 📋 Prerequisites

Before deploying, ensure you have:
- OpenAI API key
- Git repository access
- Environment variables configured

## 🌐 Deployment Options

### 1. Vercel (Frontend) + Railway (Backend)

#### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod
```

#### Backend Deployment (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy from server directory
cd server
railway login
railway init
railway up
```

### 2. Heroku (Full Stack)

#### Frontend (Static)
```bash
cd client
npm run build
# Deploy build folder to Netlify or Vercel
```

#### Backend
```bash
cd server
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your_key_here
heroku config:set NODE_ENV=production
git subtree push --prefix server heroku main
```

### 3. Netlify (Frontend) + DigitalOcean (Backend)

#### Frontend
1. Connect GitHub repo to Netlify
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/build`

#### Backend
```bash
# Create Droplet and SSH into it
ssh root@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/philvuai/bnk.git
cd bnk/server
npm install
npm run build

# Setup PM2 for process management
npm install -g pm2
pm2 start dist/app.js --name "bank-analyzer"
pm2 startup
pm2 save
```

### 4. Docker Deployment

#### Dockerfile (Server)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5001
  
  backend:
    build: ./server
    ports:
      - "5001:5001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
```

## 🔧 Environment Variables

### Required for Production

#### Backend (.env)
```env
NODE_ENV=production
PORT=5001
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=https://your-frontend-domain.com
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

#### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

## 🛡️ Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use platform-specific secret management
- Rotate API keys regularly

### 2. CORS Configuration
```typescript
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'https://www.your-frontend-domain.com'
  ],
  credentials: true
}));
```

### 3. Rate Limiting
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: 'Too many requests'
});
```

## 📊 Monitoring & Logging

### 1. Health Checks
```bash
# Test backend health
curl https://your-backend-domain.com/api/health

# Expected response
{"status":"OK","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 2. Log Monitoring
- Set up log aggregation (e.g., LogDNA, Papertrail)
- Monitor error rates and response times
- Set up alerts for API failures

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install and Build
        run: |
          cd server && npm ci && npm run build
          cd ../client && npm ci && npm run build
          
      - name: Deploy to Production
        run: |
          # Add your deployment commands here
```

## 🚨 Troubleshooting

### Common Issues

#### 1. CORS Errors
- Check `CLIENT_URL` in backend environment
- Verify frontend is making requests to correct backend URL

#### 2. File Upload Fails
- Check file size limits
- Verify uploads directory permissions
- Monitor disk space

#### 3. OpenAI API Errors
- Verify API key is correctly set
- Check rate limits and usage
- Monitor API quotas

#### 4. Memory Issues
- Increase server memory allocation
- Implement file cleanup routines
- Monitor upload directory size

### Performance Optimization

#### 1. Frontend
```bash
# Build optimized bundle
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer client/build/static/js/*.js
```

#### 2. Backend
```typescript
// Implement request compression
import compression from 'compression';
app.use(compression());

// Add response caching
app.use('/api/analysis', cache('5 minutes'));
```

## 📈 Scaling Considerations

### 1. Database Integration
- Add PostgreSQL/MongoDB for persistent storage
- Implement user authentication
- Store analysis history

### 2. File Storage
- Use cloud storage (AWS S3, Google Cloud Storage)
- Implement CDN for static assets
- Add file encryption at rest

### 3. Load Balancing
- Use multiple server instances
- Implement Redis for session storage
- Add database connection pooling

## 🛠️ Maintenance

### Regular Tasks
1. Update dependencies monthly
2. Rotate API keys quarterly
3. Monitor and clean up upload directory
4. Review and update security headers
5. Backup user data and configurations

### Monitoring Metrics
- Response time < 2 seconds
- Error rate < 1%
- Uptime > 99.9%
- File processing success rate > 95%
