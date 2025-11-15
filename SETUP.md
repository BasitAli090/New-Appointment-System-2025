# Setup Guide - Online Multi-Device Support

## Overview

The application now uses a **database** (Supabase) instead of local storage, making it work across **all devices and computers** online.

## Quick Setup (3 Steps)

### 1. Create Supabase Database (5 minutes)

1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Fill in project details and wait for setup
4. Go to **SQL Editor** → **New Query**
5. Copy and paste the entire content from `database/schema.sql`
6. Click **Run** (or press Ctrl+Enter)
7. Go to **Settings** → **API** and copy:
   - **Project URL** (SUPABASE_URL)
   - **anon public key** (SUPABASE_ANON_KEY)

### 2. Deploy to Vercel (5 minutes)

#### Option A: GitHub + Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `SUPABASE_URL` = your Supabase project URL
     - `SUPABASE_ANON_KEY` = your Supabase anon key
   - Click "Deploy"

#### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
# Add environment variables when prompted
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel --prod
```

### 3. Test the Application

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. The app will automatically load data from the database
3. Add an appointment on one device
4. Open the same URL on another device - data will be synced!

## How It Works

- **Database**: All data stored in Supabase (PostgreSQL)
- **API**: Vercel serverless functions handle all database operations
- **Sync**: Changes on one device instantly appear on all other devices
- **Offline**: Works offline with local cache, syncs when online

## File Structure

- `script-db.js` - Database-integrated version (currently active)
- `script.js` - Local storage version (backup)
- `api/` - Serverless API functions
- `database/schema.sql` - Database schema

## Switching Between Versions

**To use database (online, multi-device):**
- Use `script-db.js` (already set in index.html)

**To use local storage (offline, single device):**
- Change `index.html` line 171 to: `<script src="script.js"></script>`

## Troubleshooting

### Data not syncing?
- Check Vercel function logs
- Verify environment variables are set
- Check Supabase table permissions

### API errors?
- Open browser console (F12)
- Check Network tab for failed requests
- Verify Supabase credentials

### Database connection issues?
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check Supabase project is active
- Ensure schema.sql was run successfully

## Support

All data is now stored in the cloud and accessible from any device with internet connection!

