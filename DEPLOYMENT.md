# Deploying SDUI Web to Vercel

This guide will help you deploy the SDUI Template Mapper web application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Backend API deployed and accessible (e.g., at `https://sdui-server.onrender.com`)

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your Git provider and repository
4. Navigate to the `sdui-map-web` directory

### Step 2: Configure Project

Vercel will automatically detect Next.js settings:

- **Framework Preset:** Next.js
- **Root Directory:** `sdui-map-web` (if not at repo root)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Step 3: Environment Variables (Optional)

By default, the app uses `https://sdui-server.onrender.com` as the API URL.

To use a different API server:

1. In Vercel project settings, go to "Environment Variables"
2. Add the following variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** Your API server URL (e.g., `https://your-api-server.com`)
   - **Environment:** Production, Preview, Development (select all)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be live at `https://your-project.vercel.app`

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

Navigate to the web app directory and deploy:

```bash
cd sdui-map-web
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time)
- What's your project's name? Enter a name or press Enter for default
- In which directory is your code located? **./** (current directory)

### Step 4: Deploy to Production

After the first deployment, deploy to production:

```bash
vercel --prod
```

## Environment Variables

### Production (Default)

The app is configured to use:
```
NEXT_PUBLIC_API_URL=https://sdui-server.onrender.com
```

### Local Development

To test with a local backend server, create `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

This file is automatically ignored by Git (included in `.gitignore`).

### Custom API Server

To use a different API server in production:

**Via Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `NEXT_PUBLIC_API_URL` with your custom URL

**Via Vercel CLI:**
```bash
vercel env add NEXT_PUBLIC_API_URL
```

## Post-Deployment

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Add your custom domain and follow DNS configuration instructions

### CORS Configuration

Ensure your backend API (Render) allows requests from your Vercel domain:

In your NestJS backend (`main.ts`), update CORS settings:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://your-project.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true,
});
```

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility

### API Connection Issues

1. Verify `NEXT_PUBLIC_API_URL` environment variable
2. Check backend CORS settings
3. Ensure backend is accessible (test with curl or Postman)
4. Check browser console for specific errors

### Environment Variables Not Working

- Environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Changes to environment variables require a new deployment
- Redeploy after adding/changing environment variables

## Automatic Deployments

Once connected to Git:

- **Production:** Automatically deploys on push to `main` branch
- **Preview:** Automatically deploys on pull requests
- **Development:** Test locally before pushing

## Monitoring

View deployment status and logs:
- Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- CLI: `vercel logs`

## Rollback

If something goes wrong:

1. Go to Vercel dashboard → Deployments
2. Find a previous working deployment
3. Click "⋯" → "Promote to Production"

## Resources

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

