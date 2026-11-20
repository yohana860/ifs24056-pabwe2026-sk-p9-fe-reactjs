# Delcom Blog — Frontend (React + Vite)

React · Vite · React Router · Axios · Tailwind CSS · TOAST UI Editor & Viewer · Vitest + Testing Library

```bash
npm install
npm run dev      # http://localhost:5174 (proxy /api -> http://localhost:8081)
npm run lint
npm run test -- --coverage   # threshold 100% statements/branches/functions/lines
npm run build    # hasil di dist/ -> di-embed oleh backend (lihat scripts/build.sh di repo backend)
```
Seluruh request memakai prefix relatif `/api`, sehingga sama di mode dev (proxy Vite) maupun produksi (binary Go).
