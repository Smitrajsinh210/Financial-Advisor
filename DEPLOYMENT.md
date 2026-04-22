# Deployment Guide

## Architecture

- Frontend: Vite + React + Tailwind on Vercel or Netlify
- Backend: Express + SQLite on Render or Railway
- Database: local SQLite file persisted on the backend host

## Backend Deployment

### Render

1. Create a new Web Service from the `server` directory.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set environment variables:
   - `PORT=5000`
   - `CLIENT_URL=https://your-frontend-domain`
   - `SQLITE_PATH=./server/data/app.db`
   - `JWT_SECRET=strong_random_secret`
   - `JWT_EXPIRES_IN=7d`
   - `OPENAI_API_KEY=optional`
   - `OPENAI_MODEL=gpt-4o-mini`
   - SMTP variables if email summaries are needed

### Railway

1. Create a new project and deploy the `server` directory.
2. Add the same environment variables as above.
3. Expose the generated public URL and copy it for the frontend `VITE_API_URL`.

## Frontend Deployment

### Vercel

1. Import the repository.
2. Set the root directory to `client`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL=https://your-backend-domain/api`

### Netlify

1. Connect the repository.
2. Base directory: `client`
3. Build command: `npm run build`
4. Publish directory: `client/dist`
5. Add `VITE_API_URL`.

## Production Notes

- Keep `CLIENT_URL` and `VITE_API_URL` aligned to avoid CORS issues.
- Persist the SQLite data directory on your backend host so data survives redeploys.
- Configure SMTP if you want password reset emails and monthly summary delivery.
- If OpenAI is not configured, the backend automatically falls back to rule-based finance advice.
