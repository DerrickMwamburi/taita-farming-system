🌱 Taita-Taveta AgriNet System
An enterprise-grade Agritech platform designed to empower farmers in Taita Taveta County. The AgriNet system bridges the gap between agricultural operations and digital analytics by providing farmers with live climate data, expense tracking, projected revenue forecasting, and direct agronomic support, while giving administrators powerful broadcast and ticketing tools.

🚀 Live Environments
Frontend Application: https://taita-farming-system.vercel.app/

Backend API: https://taita-farming-system.onrender.com

🛠️ Technology Stack
Frontend Architecture:

Framework: React 18 + Vite

Styling: Tailwind CSS + Lucide React (Icons)

Data Visualization: Recharts (Dynamic Bar Charts)

Routing: React Router DOM

Backend Architecture:

Framework: Django 6.0 + Django REST Framework (DRF)

Authentication: SimpleJWT (JSON Web Tokens)

Database: SQLite (Development) / PostgreSQL (Production)

API Integrations:

OpenWeatherMap API (Live localized climate data)

Africa's Talking API (SMS OTP logic & network broadcasts)

📖 User Workflows: "Detailed to the Core"
🧑‍🌾 1. The Farmer Navigation Guide
The Farmer Portal is designed to function as a digital ledger and advisory hub.

A. Secure Onboarding & Authentication
Registration: A farmer registers by providing their legal name, E.164-formatted phone number, subcounty (e.g., Mwatate, Voi), acreage, and selecting their active crops.

SMS 2FA Verification: Upon submission, the account is created in a "locked" state. The system pings the Africa's Talking API to send a secure 6-digit OTP to the farmer's phone.

Activation: The farmer enters the OTP into the React interface. The backend verifies the code, unlocks the account, and permits login.

JWT Login: The farmer logs in securely. Access and Refresh tokens are stored in local memory to securely authorize subsequent API requests.

B. The Farmer Dashboard Experience
Upon logging in, the farmer is greeted by a personalized, responsive dashboard containing several critical modules:

Live Local Weather: Based on the farmer's registered subcounty, the system pulls live satellite data from OpenWeatherMap to display real-time temperature, humidity, wind speed, and dynamic weather icons.

Farm Configuration: Farmers can view and seamlessly edit their farm's size (acreage) and update their active crop catalog via an intuitive checkbox interface.

Activity & Expense Log: A full CRUD (Create, Read, Update, Delete) module where farmers log daily tasks (e.g., "Bought 5kg Maize Seeds") and their associated costs. Tasks can be toggled as "Complete/Pending".

Financial Forecasting: The system automatically aggregates the logged expenses against a yield algorithm to generate a dynamic Bar Chart displaying Projected Revenue vs. Total Expenses vs. Net Profit.

CSV Export: Farmers can instantly download their season's expense log as a neatly formatted .csv file for personal record-keeping or loan applications.

Network Broadcasts: A live feed displaying county-wide or localized alerts dispatched by Admins (categorized as Weather, Market, or KALRO updates).

Agronomy Support Desk: Farmers can submit detailed support tickets (e.g., identifying crop disease symptoms) directly to county agronomists, and track the status of their inquiries (Open, In Progress, Resolved).

👨‍💻 2. The Administrator Navigation Guide
The Admin interface is built to monitor system health, assist farmers, and broadcast critical data.

A. Secure Access
Administrators access the system via specialized Superuser credentials through the highly secure Django Admin portal and a dedicated React Admin Dashboard.

B. The Admin Dashboard Experience
Global Network Overview: Administrators can view aggregate statistics, including total registered farmers, total active acreage across the county, and the most commonly cultivated crops.

Ticket Management System: Admins monitor incoming agronomy requests from farmers. They can review the issue, contact the farmer via their registered phone number, and manually update the ticket status (Open ➔ In Progress ➔ Resolved).

Broadcast Campaign Control (Upcoming/Active): Admins can utilize the Africa's Talking integration to blast SMS alerts or internal dashboard notifications to specific subsets of farmers (e.g., sending a "Flash Flood Warning" exclusively to farmers registered in the Voi subcounty).

User Auditing: Complete visibility into user registration data to identify system bottlenecks or flag fraudulent accounts.

💻 Local Development Setup
To run this project locally, you will need two separate terminal windows—one for the Django backend and one for the React frontend.

1. Backend Setup (Django)
Bash
# Clone the repository
git clone https://github.com/your-username/taita-farming-system.git
cd taita-farming-system/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create a superuser account for Admin access
python manage.py createsuperuser

# Start the development server (Runs on port 8000)
python manage.py runserver
2. Frontend Setup (React/Vite)
Bash
# Open a new terminal window
cd taita-farming-system/client

# Install Node modules
npm install

# Start the Vite development server (Runs on port 5173)
npm run dev
🔐 Environment Variables
For the application to function correctly, you must configure environment variables for both the backend and frontend.

Backend (backend/.env):

Ini, TOML
SECRET_KEY=your_django_secret_key
DEBUG=True
OPENWEATHER_API_KEY=your_openweathermap_key
SMS_USERNAME=sandbox
SMS_API_KEY=your_africas_talking_api_key
Frontend (client/.env):

Ini, TOML
VITE_API_BASE_URL=http://127.0.0.1:8000  # Change to your Render URL in production
🛡️ Security Features
Stateless Authorization: Secure JWT architecture preventing session hijacking.

CORS Protection: Whitelisted cross-origin resource sharing strictly allowing Vercel and Localhost domains.

Environment Isolation: Sensitive API keys (Weather, SMS) are strictly processed server-side via Django and never exposed to the client-side browser.

Data Sanitization: Strict payload validation in Django REST Framework to prevent SQL injection and malformed data entries.