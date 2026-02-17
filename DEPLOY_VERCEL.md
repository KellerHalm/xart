# Deploy to Vercel

This repository is configured to deploy from the project root using `vercel.json`.

## What gets deployed

- `frontend` is built with Vite.
- built files are served from `frontend/dist`.
- Go API is deployed as a serverless function in `api/path.go`.
- frontend API calls to `/api/*` continue to work without code changes.

## Steps

1. Import this repo into Vercel.
2. Keep the Root Directory as repository root (`xart`).
3. Add environment variables if needed:
- `API_URL` (default: `https://api-s.anixsekai.com`)
- `CORS_ORIGIN` (default: `*`)
- `CHANGELOG_DIR` (default: `frontend/public/changelog`)
4. Run deploy.

## Local check before deploy

```bash
cd frontend && npm run build
cd ../api && go test ./...
```
