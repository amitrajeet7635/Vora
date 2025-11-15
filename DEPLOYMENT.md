# Vora Backend Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Backend Code Fixes
- [x] Fixed URL construction bug in error redirects
- [x] Updated .env.example with production configuration
- [x] Added /api/debug/env endpoint for troubleshooting

### 2. Environment Variables Setup
Check that you have all these environment variables configured in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

#### Required Environment Variables:
```
NODE_ENV=production
PORT=5001
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret-key>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=<your-frontend-vercel-url>
FRONTEND_LOGIN_SUCCESS_REDIRECT=/callback?success=true
FRONTEND_LOGIN_FAILURE_REDIRECT=/callback
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=<your-backend-vercel-url>/api/auth/callback/google
FACEBOOK_APP_ID=<your-facebook-app-id>
FACEBOOK_APP_SECRET=<your-facebook-app-secret>
FACEBOOK_CALLBACK_URL=<your-backend-vercel-url>/api/auth/callback/facebook
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
MAX_ACTIVE_SESSIONS=10
LOG_LEVEL=info
LOG_FORMAT=json
```

#### Important Notes:
- **FRONTEND_URL**: Should be your deployed frontend URL (e.g., `https://vora-auth.vercel.app`)
- **GOOGLE_CALLBACK_URL**: Should be your deployed backend URL + `/api/auth/callback/google`
- **FACEBOOK_CALLBACK_URL**: Should be your deployed backend URL + `/api/auth/callback/facebook`
- **FRONTEND_LOGIN_FAILURE_REDIRECT**: Should be `/callback` (without ?error= query param)

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Vercel

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

3. Note your backend URL (e.g., `https://vora-backend.vercel.app`)

### Step 2: Update Environment Variables on Vercel

1. Go to **Vercel Dashboard** → Select your backend project
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update all the environment variables listed above
4. **Important**: Use your actual Vercel URLs in:
   - `FRONTEND_URL`
   - `GOOGLE_CALLBACK_URL`
   - `FACEBOOK_CALLBACK_URL`

### Step 3: Update OAuth Provider Settings

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Select your **OAuth 2.0 Client ID**
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-frontend-url.vercel.app
   https://your-backend-url.vercel.app
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://your-backend-url.vercel.app/api/auth/callback/google
   ```
6. Click **Save**

#### Facebook Developer Console
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Go to **Settings** → **Basic**
4. Add **App Domains**:
   ```
   your-frontend-url.vercel.app
   your-backend-url.vercel.app
   ```
5. Add Platform → **Website**
6. Set **Site URL**: `https://your-frontend-url.vercel.app`
7. Go to **Facebook Login** → **Settings**
8. Add to **Valid OAuth Redirect URIs**:
   ```
   https://your-backend-url.vercel.app/api/auth/callback/facebook
   ```
9. Save changes

### Step 4: Update Frontend Environment Variables

1. Go to **Vercel Dashboard** → Select your **frontend** project
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```
4. **Redeploy** the frontend (Deployments → Latest deployment → Redeploy)

### Step 5: Redeploy Backend (if needed)

After updating environment variables on Vercel:
```bash
vercel --prod
```

---

## 🧪 Testing Checklist

### 1. Test Backend Endpoints

Visit these URLs in your browser:

- **Health Check**: `https://your-backend-url.vercel.app/health`
  - Should return: `{"success": true, "message": "Vora backend is healthy"}`

- **Debug Endpoint**: `https://your-backend-url.vercel.app/api/debug/env`
  - Should show all environment variables are configured
  - Check that URLs are correct

### 2. Test OAuth Flow

1. **Google Login**:
   - Visit your frontend: `https://your-frontend-url.vercel.app`
   - Click "Sign in with Google"
   - Select a Google account
   - Should redirect to `/callback?success=true`
   - Should see dashboard with user info

2. **Facebook Login**:
   - Visit your frontend: `https://your-frontend-url.vercel.app`
   - Click "Sign in with Facebook"
   - Authorize the app
   - Should redirect to `/callback?success=true`
   - Should see dashboard with user info

### 3. Check for Common Errors

If you see errors, check the debug endpoint first:
```
https://your-backend-url.vercel.app/api/debug/env
```

Common issues:
- ❌ `authentication_failed` → Check MongoDB connection, OAuth credentials
- ❌ `invalid_state` → Clear browser cookies, try again
- ❌ `provider_mismatch` → Check OAuth callback URLs
- ❌ CORS errors → Check FRONTEND_URL matches your frontend domain

---

## 🔍 Troubleshooting

### Issue: Double error parameter in URL
**Symptom**: URL shows `?error=authentication_failed?error=authentication_failed`
**Solution**: ✅ Already fixed! Make sure `FRONTEND_LOGIN_FAILURE_REDIRECT=/callback` (without query params)

### Issue: OAuth callback fails
**Possible causes**:
1. Environment variables not set correctly on Vercel
2. OAuth callback URLs don't match in Google/Facebook console
3. MongoDB connection failed
4. CORS configuration issue

**Steps to diagnose**:
1. Check `/api/debug/env` endpoint
2. Check Vercel function logs (Dashboard → Functions → View Logs)
3. Verify OAuth URLs in Google/Facebook consoles

### Issue: CORS errors
**Solution**: Make sure `FRONTEND_URL` in Vercel environment variables matches your frontend domain exactly (including https://)

### Issue: Database connection timeout
**Solution**: 
1. Check MongoDB Atlas whitelist IPs (should allow all: `0.0.0.0/0`)
2. Verify `MONGODB_URI` is correct in Vercel environment variables

---

## 📝 Post-Deployment Verification

- [ ] Backend health check returns success
- [ ] Debug endpoint shows all env vars configured
- [ ] Google login works end-to-end
- [ ] Facebook login works end-to-end
- [ ] User data persists after login
- [ ] Logout works correctly
- [ ] Session management works
- [ ] No CORS errors in browser console

---

## 🎉 Success!

If all tests pass, your Vora application is successfully deployed! 🚀

Users can now access your app at:
- **Frontend**: `https://your-frontend-url.vercel.app`
- **Backend**: `https://your-backend-url.vercel.app`

---

## 📞 Need Help?

Common resources:
- [Vercel Documentation](https://vercel.com/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
