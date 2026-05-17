# ComfortRoute — Setup & Deployment Guide

---

## Files in This Folder

```
comfortroute/
├── index.html              ← Entry HTML
├── package.json            ← Dependencies
├── vite.config.js          ← Build config
├── .gitignore              ← Keeps keys safe
├── .env.example            ← Key template (do not rename, just reference)
└── src/
    ├── main.jsx            ← React entry point
    └── ComfortRoute.jsx    ← Full app (DO NOT paste keys here)
```

---

## Step 1 — Get Your API Keys

### Google API Key
1. Go to https://console.cloud.google.com
2. Create a project (or select existing)
3. Go to **APIs & Services → Library**
4. Enable these 3 APIs:
   - **Routes API**
   - **Places API (New)**
   - **Weather API** (search "Google Weather API")
5. Go to **APIs & Services → Credentials**
6. Click **+ Create Credentials → API Key**
7. Copy the key (looks like: `AIzaSy...`)

### Anthropic API Key
1. Go to https://console.anthropic.com
2. Click **API Keys → Create Key**
3. Copy the key (looks like: `sk-ant-...`)

---

## Step 2 — Upload to GitHub

> This is required for Vercel to read your files.

1. Go to https://github.com and sign in (create account if needed — free)
2. Click **+ → New repository**
3. Name it `comfortroute`, set to **Private**, click **Create repository**
4. On the next page, click **uploading an existing file**
5. Upload ALL files maintaining this structure:
   - Drag the entire `comfortroute` folder contents
   - Make sure `src/` folder with `main.jsx` and `ComfortRoute.jsx` is inside
6. Click **Commit changes**

---

## Step 3 — Deploy on Vercel (Free)

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New → Project**
3. Find `comfortroute` in your repo list → click **Import**
4. Vercel auto-detects Vite — do NOT change any settings
5. Before clicking Deploy, click **Environment Variables** (expand it)
6. Add these two variables:

   | Name | Value |
   |------|-------|
   | `VITE_GOOGLE_API_KEY` | `AIzaSy...` (your Google key) |
   | `VITE_ANTHROPIC_API_KEY` | `sk-ant-...` (your Anthropic key) |

7. Click **Deploy**
8. Wait ~60 seconds → you get a live URL like `comfortroute.vercel.app`

---

## Step 4 — Restrict Your Google API Key (Important)

To prevent misuse:
1. Go back to https://console.cloud.google.com → Credentials
2. Click your API key
3. Under **Application restrictions** → select **Websites**
4. Add your Vercel URL: `https://comfortroute.vercel.app/*`
5. Save

---

## Making Changes Later

If you want to edit the app after deploying:
1. Edit `ComfortRoute.jsx` in GitHub directly (click the file → pencil icon)
2. Commit the change
3. Vercel automatically redeploys in ~30 seconds

---

## Demo Mode vs Live Mode

| Condition | Behavior |
|-----------|----------|
| No API keys | Mock NYC routes, demo banner shown |
| Google key only | Live routes, no Claude rationale |
| Both keys | Full experience — live routes + AI rationale |

The app works in demo mode immediately — no keys needed to see the UI.

---

## Troubleshooting

**"Failed to build"** on Vercel:
- Make sure `src/main.jsx` and `src/ComfortRoute.jsx` are in a `src/` folder
- Check that `package.json` is in the root (not inside `src/`)

**Routes not loading:**
- Check Google API key is correct in Vercel environment variables
- Make sure Routes API and Places API are enabled in Google Cloud

**Blank page:**
- Open browser console (F12) → look for red errors
- Most common: wrong folder structure on GitHub
