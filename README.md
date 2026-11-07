# Gym Management System — Frontend

React single-page app for the gym management system. It talks to the Spring Boot backend in `../gym-management-system-java`.

## Tech stack

- Vite 5, TypeScript, React 18
- Tailwind CSS and shadcn/ui (Radix UI)
- React Router, TanStack Query, React Hook Form + Zod
- Axios for REST, SockJS + STOMP for real-time chat/notifications
- Chart.js / Recharts for dashboards

## Prerequisites

- Node.js 18+ and npm
- The backend running (see its README)

## Configuration

Create a `.env` file in this folder (one already exists as a template with empty values):

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_WS_BASE_URL=http://localhost:8080/ws
```

- `VITE_API_BASE_URL` is the base URL of the REST API (used by `src/services/api.ts`; `ChatService.ts` appends `/api/chat` to it, so confirm the value matches your backend routes).
- `VITE_WS_BASE_URL` is the backend's SockJS endpoint, `/ws` (used by `src/services/socket.ts`).

## Run

```bash
npm install
npm run dev
```

The dev server listens on `http://localhost:3001`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server (port 3001) |
| `npm run build` | Production build into `dist/` |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── components/   # UI components (shadcn/ui and app components)
├── context/      # React context providers
├── hooks/        # custom hooks
├── lib/          # shared helpers
├── pages/        # route-level pages
├── services/     # API, WebSocket and domain service modules
└── utils/        # utilities
```

## Deployment

`vercel.json` is included for deploying to Vercel. Set `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` in the project's environment variables.
