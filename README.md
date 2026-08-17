# StreamCheck

Production-oriented foundation for a media streaming platform used for Playwright automation practice.

## Applications

- `frontend`: React 19, Vite, TypeScript, Redux Toolkit, React Router, Axios, Tailwind CSS, and shadcn/ui foundations.
- `backend`: Django, Django REST Framework, Simple JWT, CORS, media/static handling, filtering, and database configuration that supports SQLite and PostgreSQL.

See the `.env.example` file in each application before running it locally.

## Supabase PostgreSQL

StreamCheck can use Supabase as Django's PostgreSQL database without changing its
models, REST APIs, or JWT authentication. Copy `backend/.env.example` to
`backend/.env`, replace `DATABASE_URL` with the connection string from the
Supabase dashboard, and then apply the existing schema:

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py migrate
```

Use the Supabase Session pooler URL (port `5432`) for a persistent Django server.
For a serverless deployment, use the Transaction pooler URL (port `6543`); the
settings automatically disable prepared statements and server-side cursors.
Never expose the database URL or Supabase service-role key in the frontend.
