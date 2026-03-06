# GD AI Backend

This folder contains a simple Node.js/Express backend for the group discussion platform. It provides the following REST endpoints:

- `POST /api/register` – register new user (body: `{ username, password }`)
- `POST /api/login` – authenticate user and return JWT (body: `{ username, password }`)
- `POST /api/rooms` – create a discussion room (requires Authorization header with Bearer token)
- `POST /api/rooms/:roomId/join` – join a room as a participant (requires token)
- `POST /api/rooms/:roomId/score` – set the score for the authenticated participant (requires token)
- `GET /api/rooms/:roomId` – fetch room details

## Getting started

```bash
cd backend
npm install
npm run dev   # requires nodemon
```

By default the server listens on port 3001 and also hosts a Socket.io signaling endpoint on the same port.  CORS is enabled (`origin: '*'`) to allow the Next.js front end to connect during development.

A `/api/topic` endpoint is provided to generate a random current-affairs discussion topic using the OpenAI API. The Next.js front end calls this service directly (e.g. `http://localhost:3001/api/topic` during development), so make sure the backend is running alongside the front end. Set `OPENAI_API_KEY` in your environment before running the server.

The implementation uses in-memory stores. For production consider substituting a real database and storing the JWT_SECRET securely.
