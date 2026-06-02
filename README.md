# ClinicAI — AI Clinic Management SaaS

ClinicAI is a premium, full-stack, multi-role Clinical Administration and Diagnosis SaaS designed to streamline operations, facilitate scheduling, and empower physicians with secure Gemini AI integrations.

---

## 🚀 Live Demo
*   **Frontend Client**: [https://clinic-saas-client.vercel.app](https://clinic-saas-client.vercel.app)
*   **Backend REST API**: [https://clinic-saas-api.onrender.com](https://clinic-saas-api.onrender.com)

---

## 📋 Demo Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@clinic.com` | `Admin@1234` | Manage staff accounts, edit subscription tiers, view core analytics |
| **Doctor** | `doctor@clinic.com` | `Doctor@1234` | Patient records, clinical queues, issue diagnoses, Gemini AI checkup |
| **Receptionist** | `reception@clinic.com` | `Recept@1234` | Register new patients, book and confirm visits, daily roster checks |
| **Patient** | `patient@clinic.com` | `Patient@1234` | View profiles, download prescription PDFs, bilingual AI translations |

---

## ✨ Features

*   **Secure Multi-Role Access Control**: Standard JWT authentication with route and middleware role-shields (`admin`, `doctor`, `receptionist`, `patient`).
*   **Physician Workspace & Daily Queue**: Interactive queue sheets tracking consult checkups, diagnostics, and electronic prescriptions.
*   **SaaS Subscription Limits**: Built-in operational limit checks restricting AI-driven checks and analytics views to Pro accounts.
*   **AI Symptom Assessment**: Seamless Gemini AI symptom scanning, mapping differential diagnoses and risk assessments.
*   **Bilingual AI Prescription Explainer**: Slide-over panel explaining complex instructions in simplified English and Urdu (`اردو`).
*   **Interactive Medical Timeline**: Beautiful chronological timelines detailing historic consultations, prescriptions, and diagnosis reports.
*   **Print-Ready Medical Reports**: Native window printing optimized via media CSS stylesheets.
*   **Dynamic Data Caching**: Zustand cache manager delaying list re-fetches up to 5 minutes to optimize API performance.

---

## 🛠️ Tech Stack

### Frontend
*   **Core**: React 18, Vite
*   **State Management**: Zustand
*   **Forms & Validation**: React Hook Form, Zod
*   **Styles**: TailwindCSS, Lucide React
*   **Notifications**: React Hot Toast

### Backend
*   **Server**: Node.js, Express.js
*   **Database**: MongoDB, Mongoose
*   **Security**: Helmet, CORS, Express Rate Limit, BcryptJS, JWT

### Infrastructure
*   **AI Integration**: Google Gemini API SDK (`@google/generative-ai`)
*   **PDF Compiler**: PDFKit
*   **Hosting**: Vercel (Client), Render (API)

---

## 📁 Project Structure

```
clinic-saas/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── api/                # Axios API binds
│   │   ├── components/         # Shared & AI components
│   │   ├── hooks/              # Custom debouncing hooks
│   │   ├── layouts/            # Auth & Dashboard layouts
│   │   ├── pages/              # Role-specific workspaces
│   │   └── store/              # Zustand Auth & Caching stores
│   └── package.json
└── server/                     # Node/Express Backend
    ├── config/                 # DB connections
    ├── controllers/            # Controller endpoints
    ├── middleware/             # Role authorization guards
    ├── models/                 # Mongoose schemas
    ├── routes/                 # API route definitions
    ├── seeders/                # Demo credentials seeder
    └── server.js
```

---

## ⚙️ Setup & Local Installation

### Prerequisites
*   Node.js (v16.x or higher)
*   Local MongoDB instance or a MongoDB Atlas Cluster

### 1. Configure the Backend
Navigate to the `server/` folder, copy the environment template, and install packages:
```bash
cd server
npm install
```
Create a `.env` file inside the `server/` directory and configure the variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/clinic-saas
JWT_SECRET=your_jwt_signing_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
```

### 2. Seed the Database
Seed the demo accounts by executing the seed script locally:
```bash
npm run seed
```
*(Alternatively, you can call the exposed `GET /api/seed` endpoint on the running server).*

### 3. Start the Backend Server
```bash
npm run dev
```

### 4. Configure the Frontend
Open a new terminal, navigate to the `client/` folder, and install packages:
```bash
cd client
npm install
```
Create a `.env` file inside the `client/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 5. Start the React Frontend
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. You can log in using any of the **Demo Credentials** listed above!
