# Jotify - Standard Runbook

This project follows a standard company-style workflow:

1. Development: run frontend + backend separately via dev servers.
2. Production: build frontend to `dist/`, then serve it from the backend with `NODE_ENV=production`.

Below are the exact steps to follow.

**Prerequisites**
1. Node.js 18+ (recommended)
2. MongoDB connection string

**Environment**
1. Backend: create `backend/.env` using `backend/.env.example` as a template.
2. Frontend (dev/prod split):
   - `frontend/.env.development` for local dev
   - `frontend/.env.production` for production builds
   - Both should define `VITE_GOOGLE_CLIENT_ID`

**Development**
1. Install dependencies:
   - `npm install`
2. Run dev servers (frontend + backend):
   - `npm run dev`

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5001`

**Production (local or server)**
1. Build frontend:
   - `npm run build`
2. Start backend in production mode:
   - `npm run start`

This will:
- Serve `frontend/dist` from the backend
- Enable production security behavior

**Common Notes**
1. Google Login requires configuring authorized origins in Google Cloud Console:
   - `http://localhost:5173` (dev)
   - Your production domain (prod, HTTPS only)
2. `NODE_ENV=production` is industry standard. It affects:
   - Security headers (CSP)
   - Cookie settings
   - Performance optimizations
3. If you change environments, restart the backend to apply changes.
4. Use separate Google OAuth client IDs for dev and prod to avoid origin confusion.

**Troubleshooting (Common Issues)**
1. `401` on `/api/auth/refresh`
   - Cause: refresh cookie not set
   - Fix: ensure backend is running, same host (avoid `localhost` vs `127.0.0.1`), and restart after env changes
2. `429 Too Many Requests`
   - Cause: repeated refresh attempts after `401`
   - Fix: resolve the `401` first; the 429 will disappear
3. Google Login `The given origin is not allowed for the given client ID`
   - Cause: Google OAuth client does not allow current origin
   - Fix: add the exact origin you are visiting (scheme + host + port)
   - Recommended: use separate client IDs for dev vs prod
4. CSP error blocking Google script
   - Cause: CSP disallows `https://accounts.google.com`
   - Fix: ensure CSP allows Google script sources when `NODE_ENV=production`
