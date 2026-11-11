# NoteVault — Frontend

React + Vite + Tailwind frontend for the NoteVault note-taking app.

## Links
- Live: https://note-vault-frontend.vercel.app
- Backend API: https://notevault-backend-ddoo.onrender.com
- Backend repo: https://github.com/AbirRaufun/NoteVault-backend

## Features
- Login / Register with JWT (stored in localStorage)
- My Notes: grid of notes with create / edit / delete, paginated (6 per page)
- Admin panel (visible to admins only): user table with create / role change / delete, plus all-notes view
- Insights: users grouped by interest, posts by user (uses $lookup on the backend), create-post form

## Run locally

Create `.env` with `VITE_API_URL=http://localhost:8080/api`, then run `npm install` and `npm run dev`.