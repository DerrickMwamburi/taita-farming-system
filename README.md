# Taita-Taveta Agricultural Data System (MVP)

## Executive Summary

The Taita-Taveta Agricultural Data System is a full-stack web application designed to digitize and aggregate farming operations across the region. Built with a focus on frictionless data collection, the platform allows farmers to register their operational zones and active crops in seconds without the barrier of account creation. Authorized administrators can then access a secure, real-time analytics dashboard to monitor regional agricultural trends, network size, and crop distribution.

## System Architecture

This project utilizes a modern, decoupled architecture ensuring high performance, security, and scalability.

**Frontend (Client)**

* **Framework:** React.js powered by Vite for rapid compilation and optimized production builds.
* **Routing:** React Router DOM for secure, multi-page navigation.
* **Styling:** Tailwind CSS for a fully responsive, mobile-first user interface.

**Backend (API & Database)**

* **Framework:** Django & Django REST Framework (DRF).
* **Database:** PostgreSQL for robust relational data management.
* **Authentication:** JSON Web Tokens (JWT) via `djangorestframework-simplejwt` for secure, stateless admin sessions.

---

## Core Workflows

### 1. The Frictionless Public Intake

Optimized for grassroots adoption, the public interface (`/`) is a high-converting landing page.

* Farmers input their Full Name, Phone Number (must be unique), Subcounty, and select their active crops.
* The frontend dynamically fetches available crops from the backend, ensuring data consistency.
* Submission is immediate, with no password creation required, funneling data directly into the PostgreSQL database.

### 2. Secure Administrative Access

System administrators navigate to a hidden portal (`/login`) protected by JWT authentication.

* Upon successful authentication, access and refresh tokens are securely stored in the browser.
* Unauthorized access attempts to the dashboard automatically redirect to the login screen.

### 3. Regional Analytics Dashboard

The investor-facing dashboard (`/dashboard`) consumes a custom, protected API endpoint. It aggregates raw database rows into high-level business intelligence:

* **Total Network Size:** Real-time count of verified farmers in the system.
* **Regional Distribution:** Breakdown of agricultural activity across operational zones (Mwatate, Voi, Wundanyi, Taveta).
* **Active Crop Index:** Popularity tracking of specific crops (e.g., Maize, Macadamia, Green Grams, Groundnuts) to identify regional trends.

---

## Data Models (Schema Overview)

**Farmer (`management_farmer`)**
The core identity model representing an agricultural entity.

* `full_name` (CharField)
* `phone_number` (CharField, Unique)
* `subcounty` (CharField, Choices)
* `crops` (ManyToManyField -> Crop)
* `onboarded_at` (DateTimeField)

**Crop (`management_crop`)**
A dynamic registry of agricultural products tracked by the system.

* `name` (CharField)
* `description` (TextField)

---

## API Endpoints

### Public Endpoints (No Authentication Required)

* `GET /api/crops/` - Retrieves the dynamic list of available crops for the intake form.
* `POST /api/farmers/` - Ingests new farmer registration data.
* `POST /api/token/` - Validates admin credentials and issues JWT access/refresh tokens.

### Protected Endpoints (JWT Required)

* `GET, PUT, DELETE /api/farmers/` - Administrative CRUD operations on farmer records.
* `POST, PUT, DELETE /api/crops/` - Administrative CRUD operations on the crop registry.
* `GET /api/analytics/regional/` - Aggregates real-time metrics for the administrative dashboard.

---

## Local Development Setup

**1. Backend Initialization**

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

```

**2. Frontend Initialization**

```bash
cd client
npm install
npm run dev

```