# Deployment

Render-ready files are included as a starting point.

1. Create a Render web service from this repository.
2. Set Node version to 20+.
3. Build command: `npm install && npm run build`.
4. Start command for the current V1 API: `npm run dev:api`.
5. Add environment variables from `.env.example`.
6. Add Supabase variables once persistence is implemented.

For production, replace the in-memory store with Supabase/PostgreSQL and add admin-only authentication before exposing the app beyond a private environment.
