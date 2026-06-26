# Deployment Guide: NeoMind to GitHub & Browser

This guide walks you through deploying NeoMind to GitHub and opening it in your browser.

## Step 1: Create a GitHub Repository

### If you don't have a GitHub account:
1. Go to https://github.com/join
2. Sign up with your email
3. Verify your email
4. Create a new account

### Create a new repository:
1. Go to https://github.com/new
2. **Repository name**: `neomind`
3. **Description**: "AI-Based Early Detection of Neurodevelopmental Disorders in Newborns"
4. **Visibility**: Public (or Private)
5. Click **Create repository**

## Step 2: Push Code to GitHub

### From your project directory:

```bash
cd /path/to/neomind

# If git is not initialized
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial NeoMind commit: Complete AI healthcare platform"

# Add remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/neomind.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify it worked:**
- Go to https://github.com/YOUR-USERNAME/neomind
- You should see all your files there

## Step 3: Set Up Environment Variables for Deployment

### Option A: Vercel (Recommended - Easiest)

#### 1. Connect to Vercel

Go to https://vercel.com and:
- Click **Sign up** (or log in)
- Click **Continue with GitHub**
- Authorize Vercel to access your GitHub account
- Select your `neomind` repository

#### 2. Configure Environment Variables

In the Vercel dashboard:
1. Click **Settings** → **Environment Variables**
2. Add two variables:

**Variable 1:**
- **Name**: `VITE_SUPABASE_URL`
- **Value**: Your Supabase project URL (from Settings → API)
- Click **Add**

**Variable 2:**
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon key (from Settings → API)
- Click **Add**

#### 3. Deploy

- Click **Deployments**
- Click **Deploy** (or it auto-deploys on push)
- Wait for the build to finish (~2 minutes)

**Your live site URL:** `https://neomind-yourname.vercel.app`

---

### Option B: Railway

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

#### 2. Initialize Railway

```bash
cd neomind
railway init
```

Choose:
- Project name: `neomind`
- Environment: `production`

#### 3. Set Environment Variables

```bash
railway variable add VITE_SUPABASE_URL=your_supabase_url
railway variable add VITE_SUPABASE_ANON_KEY=your_supabase_key
```

#### 4. Deploy

```bash
railway up
```

**Your live site URL:** Will be shown in the Railway dashboard

---

### Option C: GitHub Pages (Free)

#### 1. Enable GitHub Pages

1. Go to your repo: https://github.com/YOUR-USERNAME/neomind
2. Click **Settings** → **Pages**
3. **Branch**: Select `main`
4. **Folder**: Select `/(root)`
5. Click **Save**

#### 2. Update package.json

Add this script:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### 3. Install gh-pages package

```bash
npm install --save-dev gh-pages
```

#### 4. Create .env file for GitHub Pages

Create `.env.production`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

#### 5. Deploy

```bash
npm run deploy
```

**Your live site URL:** `https://YOUR-USERNAME.github.io/neomind`

---

## Step 4: Get Supabase Credentials

1. Go to https://app.supabase.com
2. Select your NeoMind project (or create one at https://app.supabase.com/projects)
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon (public)** → `VITE_SUPABASE_ANON_KEY`

## Step 5: Open Your Site in Browser

### Vercel
```
https://neomind-yourname.vercel.app
```

### Railway
```
https://your-railway-domain.up.railway.app
```

### GitHub Pages
```
https://YOUR-USERNAME.github.io/neomind
```

---

## Complete Step-by-Step Example

Let's say your GitHub username is `johndoe`:

### 1. Create repo on GitHub
- Go to https://github.com/new
- Name: `neomind`
- Create

### 2. Push code
```bash
git remote add origin https://github.com/johndoe/neomind.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

**a) Go to https://vercel.com**
- Click **New Project**
- Import your GitHub repo `johndoe/neomind`

**b) Add environment variables**
```
VITE_SUPABASE_URL = https://xyzabc.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
```

**c) Click Deploy**

### 4. Your site is live!
```
https://neomind-johndoe.vercel.app
```

---

## Testing After Deployment

### 1. Open your deployed site
```
https://neomind-yourname.vercel.app
```

### 2. Sign up
- Email: `test@example.com`
- Password: `TestPassword123!`
- Role: `Clinician`

### 3. Test features
- Click **Dashboard** → See mock analytics
- Click **Patients** → See demo patients
- Click **Add Patient** → Complete 4-step form
- Click **Video Analysis** → Drag & drop a video (or fake upload)
- Click **Admin** → View platform analytics (admin only)

---

## Troubleshooting

### Deployment fails with "Module not found"
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Blank page after deploy
1. Check browser console (F12) for errors
2. Verify `.env` variables are set in deployment platform
3. Check Supabase project is active

### Can't log in
1. Verify Supabase URL and key in `.env`
2. Ensure Supabase project exists
3. Check email is correct

### Build size warning
Normal — our app is 1.0 MB (279 KB gzipped). Already optimized.

---

## Making Updates

### Every time you change code:

```bash
# Make changes...
git add .
git commit -m "Add feature X"
git push origin main
```

**Vercel/Railway auto-deploys** — your site updates automatically!

---

## Summary

| Step | Time | Action |
|------|------|--------|
| 1 | 5 min | Create GitHub repo |
| 2 | 5 min | Push code to GitHub |
| 3 | 5 min | Connect to Vercel |
| 4 | 2 min | Add environment variables |
| 5 | 2 min | Deploy |
| **Total** | **~20 min** | **Live on the internet!** |

---

## Need Help?

- **GitHub Issues**: Open an issue at https://github.com/YOUR-USERNAME/neomind/issues
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

**Happy deploying! 🚀**
