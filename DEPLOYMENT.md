# Deployment Guide - Al Farooq Kidney Center

## Quick Start

### Step 1: Set Up Supabase Database

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up for a free account
   - Create a new project

2. **Run Database Schema**
   - In Supabase dashboard, go to **SQL Editor**
   - Copy and paste the entire content from `database/schema.sql`
   - Click **Run** to execute

3. **Get API Credentials**
   - Go to **Settings** → **API**
   - Copy your **Project URL** (SUPABASE_URL)
   - Copy your **anon/public key** (SUPABASE_ANON_KEY)

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click **New Project**
   - Import your GitHub repository
   - Add environment variables:
     - `SUPABASE_URL` = your Supabase project URL
     - `SUPABASE_ANON_KEY` = your Supabase anon key
   - Click **Deploy**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted

# Redeploy with environment variables
vercel --prod
```

### Step 3: Update API Configuration

After deployment, your app will be available at `https://your-app.vercel.app`

The `api-config.js` file automatically uses the current origin, so no changes needed if deployed to Vercel.

## Environment Variables

Required environment variables in Vercel:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Testing

After deployment:

1. Visit your Vercel URL
2. Try adding an appointment
3. Check Supabase dashboard → Table Editor to see data
4. Test all features (add, edit, delete, patient status)

## Troubleshooting

### API Errors

- Check Vercel function logs: Vercel Dashboard → Your Project → Functions
- Verify environment variables are set correctly
- Check Supabase API keys are correct

### Database Issues

- Verify schema was run successfully in Supabase
- Check table permissions in Supabase
- Ensure RLS (Row Level Security) is disabled or configured properly

### CORS Errors

- CORS is already configured in `vercel.json`
- If issues persist, check API route headers

## Support

For issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify all environment variables are set

