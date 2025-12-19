# Clinic Frontend (React)

A simple React + TypeScript UI that matches the backend in `SE2_clinic_api-main`:

- `GET/POST/PUT/DELETE /api/patients`
- `GET/POST/PUT/DELETE /api/doctors`
- `GET/POST/PUT/DELETE /api/appointments` (GET endpoints return populated `patientId` and `doctorId`)

## 1) Configure API base URL

Create a `.env` file (or copy `.env.example`):

```bash
cp .env.example .env
```

Then set:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 2) Install + run

```bash
npm install
npm run dev
```

Open: http://localhost:5173

## Notes

- Birth dates use an `<input type="date">` and are sent as ISO strings.
- Appointment start/end use `<input type="datetime-local">` and are sent as ISO strings.
- If you see CORS issues, confirm the backend has `app.use(cors())` (it does in your zip).
