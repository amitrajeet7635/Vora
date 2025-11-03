# Vora Frontend - Deployment Guide

## 📦 Build Instructions

### Prerequisites
- Node.js v18+ installed
- npm or yarn package manager

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Application will run at: `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   ```
   
   Output will be in `dist/` folder

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Using Vercel CLI:**

1. Install Vercel CLI
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel
   ```bash
   vercel login
   ```

3. Deploy
   ```bash
   vercel
   ```

4. Set Environment Variables in Vercel Dashboard
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-api.com`

**Using Vercel Dashboard:**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable: `VITE_API_URL`
5. Deploy

---

### Option 2: Netlify

**Using Netlify CLI:**

1. Install Netlify CLI
   ```bash
   npm i -g netlify-cli
   ```

2. Build the project
   ```bash
   npm run build
   ```

3. Deploy
   ```bash
   netlify deploy --prod --dir=dist
   ```

**Using Netlify Dashboard:**

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-api.com`
6. Deploy

**Create `netlify.toml` (optional):**
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: GitHub Pages

1. Install gh-pages
   ```bash
   npm install -D gh-pages
   ```

2. Update `vite.config.js`:
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/',
   })
   ```

3. Add deploy script to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

4. Deploy
   ```bash
   npm run deploy
   ```

---

### Option 4: AWS S3 + CloudFront

1. Build the project
   ```bash
   npm run build
   ```

2. Create S3 bucket and enable static website hosting

3. Upload `dist/` contents to S3
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. Create CloudFront distribution pointing to S3 bucket

5. Configure custom error responses to serve `index.html` for SPA routing

---

### Option 5: Docker

**Create `Dockerfile`:**
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Create `nginx.conf`:**
```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Caching for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Build and Run:**
```bash
docker build -t vora-frontend .
docker run -p 80:80 vora-frontend
```

---

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` or `https://api.vora.com` |

### Setting Environment Variables

**Local Development (.env file):**
```env
VITE_API_URL=http://localhost:5000
```

**Production (Platform-specific):**

- **Vercel**: Dashboard → Project Settings → Environment Variables
- **Netlify**: Dashboard → Site Settings → Environment Variables
- **GitHub Actions**: Repository Settings → Secrets and Variables
- **Docker**: Pass via `-e` flag or docker-compose environment section

---

## ✅ Pre-Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test production build with `npm run preview`
- [ ] Set `VITE_API_URL` environment variable
- [ ] Configure CORS on backend for your domain
- [ ] Test OAuth redirects with production URLs
- [ ] Enable HTTPS (required for OAuth)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and analytics

---

## 🔒 Security Considerations

1. **HTTPS Required**: OAuth providers require HTTPS in production
2. **Environment Variables**: Never commit `.env` files to git
3. **CORS Configuration**: Ensure backend allows requests from your frontend domain
4. **OAuth Redirects**: Update OAuth app settings with production callback URLs

---

## 🐛 Troubleshooting

### Build Fails
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist && npm run build`

### Blank Page After Deployment
- Check browser console for errors
- Verify `base` in vite.config.js is correct
- Ensure SPA routing is configured (redirects to index.html)

### OAuth Not Working
- Verify `VITE_API_URL` is set correctly
- Check OAuth callback URLs in provider settings
- Ensure HTTPS is enabled
- Check browser cookies are enabled

### API Requests Failing
- Verify CORS configuration on backend
- Check `VITE_API_URL` environment variable
- Ensure backend is accessible from frontend domain

---

## 📊 Performance Optimization

Vora frontend is already optimized with:
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Asset optimization
- ✅ Lazy loading for routes

For additional optimization:
- Use CDN for static assets
- Enable gzip/brotli compression
- Configure caching headers
- Use image optimization services

---

## 🎯 Post-Deployment

1. Test all features in production
2. Monitor error logs
3. Set up uptime monitoring
4. Configure analytics (Google Analytics, Plausible, etc.)
5. Create staging environment for testing

---

## 📞 Support

For issues or questions, refer to:
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Deployment URL Example**: `https://vora.vercel.app`

**Status**: ✅ Production Ready
