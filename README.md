AgriNet: Taita-Taveta Farming System 🌱

A full-stack agricultural management and market integration platform designed specifically for farmers and administrators in Taita-Taveta County, Kenya.

📖 About The Project

AgriNet is built to bridge the gap between rural farmers and agricultural administrators. Operating out of Mwatate, the system provides a dual-portal interface:

Farmer Portal: Allows local farmers to register, view real-time crop market prices, and log their daily farming activities.

Command Center (Admin): A highly-privileged dashboard for agricultural officers to manage crop catalogs, monitor registered farmers, and broadcast county-wide alerts.

🚀 Tech Stack

Frontend:

React (via Vite)

Tailwind CSS

React Router (SPA Routing)

Deployed on: Vercel

Backend:

Python 3 & Django

Django REST Framework (DRF)

JWT (JSON Web Tokens) for secure Authentication

PostgreSQL (Live Cloud Database)

Deployed on: Render

✨ Core Features

Role-Based Access Control (RBAC): Strict separation between standard farmers and Superusers (Admins).

Secure JWT Authentication: Token-based sessions ensuring data integrity.

Dynamic Market Ticker: Live polling of crop prices from the cloud database.

Automated Cloud Migrations: Backend dynamically runs migrate and creates superusers upon deployment via wsgi.py.

SPA Route Rewrites: Configured vercel.json to handle smooth frontend page refreshing without 404 errors.

🛠️ Local Development Setup

To run this project locally, you will need Node.js (for the frontend) and Python 3 (for the backend) installed on your machine.

1. Clone the Repository

git clone git@github.com:DerrickMwamburi/taita-farming-system.git
cd taita-farming-system


2. Backend Setup (Django)

Open a terminal in the backend directory (or wherever your manage.py file lives).

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (creates local SQLite db)
python manage.py migrate

# Start the Django development server
python manage.py runserver


The backend will now be running on http://127.0.0.1:8000

3. Frontend Setup (React/Vite)

Open a new terminal in your frontend root directory (where package.json lives).

# Install Node dependencies
npm install


Environment Variables:
Create a .env file in the root of your frontend folder and add the following line to point to the local backend:

VITE_API_BASE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)


(Note: To test against the live production database, change this to https://taita-farming-system.onrender.com)

# Start the React development server
npm run dev


The frontend will now be running on http://localhost:5173

🌍 Production Deployment Notes

Frontend (Vercel)

The frontend is hosted on Vercel. It requires a VITE_API_BASE_URL environment variable pointing to the live Render backend URL. A vercel.json file is included in the root to ensure React Router handles page refreshes correctly.

Backend (Render)

The backend is hosted as a Web Service on Render, connected to a managed PostgreSQL database.
Key Render Environment Variables required:

DATABASE_URL: Connection string for PostgreSQL.

DJANGO_SUPERUSER_USERNAME: The admin username (e.g., katute).

DJANGO_SUPERUSER_PASSWORD: The secure password for the admin account.

Built for the future of farming in Taita-Taveta..