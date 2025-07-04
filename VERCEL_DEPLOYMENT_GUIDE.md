# 🚀 Vercel Deployment Guide - Quick Setup

## Prerequisites
- Vercel account (free at vercel.com)
- Git repository with your code pushed

## 📦 Step 1: Deploy Backend First

1. Go to [vercel.com](https://vercel.com) and click "Add New Project"
2. Import your Git repository
3. In the configuration:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   
4. Add Environment Variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   FRONTEND_URL=https://your-frontend-name.vercel.app
   ```
   (You'll update FRONTEND_URL after deploying frontend)

5. Click "Deploy"
6. Copy your backend URL (e.g., `https://fitness-backend.vercel.app`)

## 🎨 Step 2: Deploy Frontend

1. Create another new project in Vercel
2. Import the same Git repository
3. In the configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-name.vercel.app/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Click "Deploy"

## 🔄 Step 3: Update Backend CORS

1. Go back to your Backend project in Vercel
2. Go to Settings → Environment Variables
3. Update `FRONTEND_URL` with your actual frontend URL
4. Redeploy the backend (Settings → Deployments → Redeploy)

## ✅ That's it!

Your app should now be live with:
- Frontend: `https://your-frontend-name.vercel.app`
- Backend API: `https://your-backend-name.vercel.app/api`

## 🐛 Troubleshooting

### CORS Issues
- Make sure `FRONTEND_URL` in backend matches exactly your frontend URL
- Include `https://` in the URL

### API Not Working
- Check that `VITE_API_URL` ends with `/api`
- Verify all environment variables are set correctly

### Authentication Issues
- Ensure Supabase URL and keys are correct
- Check that both frontend and backend use the same Supabase project

## 🔧 Local Testing
To test with production URLs locally:
```bash
# Frontend
cd frontend
VITE_API_URL=https://your-backend.vercel.app/api npm run dev

# Backend
cd backend
FRONTEND_URL=http://localhost:5173 npm run dev
```