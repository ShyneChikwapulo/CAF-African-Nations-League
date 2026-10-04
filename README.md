# African Nations League

A full-stack football tournament simulator. Federation representatives register teams, an admin builds an eight-team knockout bracket, and each match can be simulated quickly or played with AI-generated commentary.

Solo project, built for the UCT Honours (Information Systems) entrance assessment.
<!-- CONFIRM: wording of the UCT line, and whether a live URL exists. -->

<!-- Screenshots: add to docs/screenshots/ and uncomment
![Home](docs/screenshots/home.png)
![Bracket](docs/screenshots/bracket.png)
![Match](docs/screenshots/match.png)
-->

## Features

- **Team registration:** a representative registers a country and receives a generated 23-player squad (3 GK, 8 DF, 8 MD, 4 AT) with randomised ratings and a team average.
- **Demo teams:** the admin can seed seven extra teams (Nigeria, Egypt, Senegal, Morocco, Ghana, Ivory Coast, Cameroon).
- **Tournament:** an 8-team bracket with quarter-finals, semi-finals and a final. Winners advance automatically.
- **Two ways to play a match:** a quick rating-weighted simulation, or a played match where an LLM (GPT-4o via OpenRouter) writes commentary for the generated events, with a fallback if the call fails.
- Match detail pages, a goal-scorer leaderboard and a winner screen.
- Result emails to both teams (Nodemailer).
- JWT authentication with bcrypt-hashed passwords.

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | Firebase Firestore (firebase-admin) |
| Auth | JWT, bcryptjs |
| Email | Nodemailer |
| AI | OpenRouter (`openai/gpt-4o`) |

## Repository layout

```text
backend/    Express API (src/routes, services, middleware, config, scripts)
frontend/   React app
```

## Getting started

**Prerequisites:** Node.js 18+, a Firebase project with Firestore, an OpenRouter API key, and a Gmail app password if you want email.

```bash
git clone https://github.com/ShyneChikwapulo/CAF-African-Nations-League.git
cd CAF-African-Nations-League

# Backend
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=<long-random-string>
OPENROUTER_API_KEY=<your-key>
EMAIL_SERVICE=gmail
EMAIL_USER=<your-email>
EMAIL_PASS=<app-password>
# Optional: instead of backend/serviceAccountKey.json
FIREBASE_SERVICE_ACCOUNT={...service account JSON on one line...}
```

In development the backend reads `backend/serviceAccountKey.json` first (download it from Firebase Console > Project Settings > Service Accounts; never commit it) and falls back to `FIREBASE_SERVICE_ACCOUNT`.

```bash
npx ts-node src/scripts/createAdmin.ts   # creates the admin user (see the note below)
npm run dev                              # API on http://localhost:5000, health check at /api/health
```

In a second terminal:

```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm start                                # http://localhost:3000
```

> **Note:** the admin script currently has the admin email and password hard-coded. Change them before using this anywhere public.

## Usage

1. Register a team (choose a country).
2. Sign in as the admin and open the Admin Panel.
3. Click **Seed Demo Data** to add seven teams.
4. Select eight teams and click **Create Tournament**.
5. Play each match with **Simulate Match** or **Play Match with AI**.

## Testing

The frontend contains only the default Create React App test. There is no backend test suite yet.

## Roadmap

- Protect the tournament, match-play and seed endpoints with authentication and admin checks
- Read admin credentials from environment variables and remove the debug route
- Visual redesign of the UI
- Backend tests for bracket progression and match logic

## Author

Shine Chikwapulo · [GitHub](https://github.com/ShyneChikwapulo) · [LinkedIn](https://www.linkedin.com/in/shine-chikwapulo-741b20265/)
