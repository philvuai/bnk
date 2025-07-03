# 🚀 Netlify Deployment Guide

## Quick Fix for 404 Error

The 404 error occurs because Netlify needs specific configuration for React Single Page Applications. Follow these steps:

### ✅ **Step 1: Verify Repository Structure**

Make sure your GitHub repository has the `netlify.toml` file in the root:

```toml
[build]
  base = "client/"
  publish = "client/build/"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### ✅ **Step 2: Configure Netlify Site Settings**

In your Netlify dashboard:

1. **Site Settings** → **Build & Deploy** → **Build Settings**
2. Set these values:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`

### ✅ **Step 3: Environment Variables**

In Netlify dashboard:

1. Go to **Site Settings** → **Environment Variables**
2. Add this variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.com` (your backend deployment URL)

### ✅ **Step 4: Deploy from GitHub**

1. Connect your GitHub repository
2. Select the `main` branch
3. Click **Deploy Site**

## 🔧 **Alternative: Manual Deployment**

If the above doesn't work, try manual deployment:

### Local Build & Upload

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Build for production
npm run build

# The build folder is ready to upload to Netlify
```

Then drag and drop the `build` folder to Netlify.

## 🛠 **Backend Deployment Options**

Since Netlify only hosts static sites, you'll need a separate backend deployment:

### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd server
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

### Option 2: Heroku
```bash
cd server
heroku create your-app-name-api
heroku config:set OPENAI_API_KEY=your_key_here
git subtree push --prefix server heroku main
```

### Option 3: Render
1. Connect GitHub repo to Render
2. Create new Web Service
3. Set root directory to `server`
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`

## 🔗 **Connect Frontend to Backend**

After deploying your backend, update the frontend environment variable:

In Netlify **Site Settings** → **Environment Variables**:
- **REACT_APP_API_URL**: `https://your-backend-url.com`

## 🚨 **Troubleshooting**

### Common Issues:

#### 1. **404 Error on Refresh**
- ✅ Add `netlify.toml` file
- ✅ Ensure `_redirects` file in `client/public/`
- ✅ Set build settings correctly

#### 2. **Build Fails**
- ✅ Check Node.js version (set to 18 in netlify.toml)
- ✅ Verify all dependencies in client/package.json
- ✅ Check build logs for specific errors

#### 3. **API Calls Fail**
- ✅ Set `REACT_APP_API_URL` environment variable
- ✅ Deploy backend separately
- ✅ Check CORS settings in backend

#### 4. **Assets Not Loading**
- ✅ Check `homepage` field in client/package.json
- ✅ Verify build directory is `client/build`

## 📱 **Testing Your Deployment**

1. **Frontend**: Visit your Netlify URL
2. **Upload Test**: Try uploading a sample document
3. **API Connection**: Check browser console for API errors
4. **Functionality**: Test full workflow

## 📊 **Example Working URLs**

After successful deployment:
- **Frontend**: `https://your-site-name.netlify.app`
- **Backend**: `https://your-backend.railway.app` (or other platform)
- **API Health**: `https://your-backend.railway.app/api/health`

## 🔄 **Continuous Deployment**

With proper setup:
1. Push changes to GitHub
2. Netlify automatically rebuilds
3. Changes go live in minutes

## 📝 **Final Checklist**

- [ ] `netlify.toml` in repository root
- [ ] `_redirects` file in `client/public/`
- [ ] Build settings configured in Netlify
- [ ] Environment variables set
- [ ] Backend deployed separately
- [ ] API endpoints working
- [ ] CORS configured correctly
- [ ] Test upload functionality
