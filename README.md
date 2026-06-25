# Taita Farming System (AgriNet)

AgriNet is a centralized agricultural management platform tailored for Taita-Taveta County. It bridges the gap between local farmers and county-wide agricultural data, enabling smarter farming decisions through real-time market insights and personalized farm management.

## 📁 Project Architecture
The project follows a clean separation between the Django-based API backend and the React-based frontend.

```text
TAITA_FARMING_SYSTEM/
├── backend/
│   ├── core/                # Django project configuration
│   │   ├── __init__.py, asgi.py, settings.py, urls.py, wsgi.py
│   ├── management/          # Core business logic & models
│   │   ├── migrations/      # Database schema history
│   │   ├── admin.py, apps.py, models.py, serializers.py, sms.py, views.py
│   ├── venv/                # Virtual environment
│   ├── manage.py            # Django entry point
│   └── requirements.txt     # Dependency list
├── client/                  # React/Vite Frontend
│   ├── node_modules/        # Project dependencies
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── assets/
│   │   ├── App.jsx          # Router & Layout logic
│   │   ├── Dashboard.jsx    # Admin command center
│   │   ├── Landing.jsx      # Public homepage
│   │   ├── Login.jsx        # Authentication view
│   │   ├── MyFarm.jsx       # Farmer portal
│   │   ├── Register.jsx     # Registration flow
│   │   ├── ThemeToggle.jsx  # Dark/Light mode engine
│   │   └── index.css        # Tailwind v4 directives
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md

🚀 Technical Highlights
Authentication: Secure JWT-based authentication using Django SimpleJWT.

Dynamic Routing: Intelligent redirection after login based on user profile (Farmer vs. Admin).

Theming: Full manual dark/light mode toggle integrated with Tailwind CSS v4.

Data Visualization: Real-time analytics and charts powered by recharts.

Administrative Control: Full CRUD capabilities for administrators with CSV export functionality.

🛠 Setup & Installation
# Backend
cd backend

Create and activate venv: python -m venv venv

Install requirements: pip install -r requirements.txt

Apply migrations: python manage.py migrate

Run server: python manage.py runserver

# Frontend
cd client

Install dependencies: npm install

Start development: npm run dev

⚙️ Configuration
Dark Mode: Enabled via class-based toggling (.dark) configured in index.css.

CORS: Ensure backend/core/settings.py includes your frontend origin (http://localhost:5173) in CORS_ALLOWED_ORIGINS.

Maintained as of June 2026. Built to empower Taita-Taveta agricultural stakeholders.