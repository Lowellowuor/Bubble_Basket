# ?? Bubble Basket Laundry – On-Demand Laundry Management System

A modern, full-stack laundry management platform built for university communities.  
Digitises ordering, payments, and operations – replacing WhatsApp chaos with a structured, real-time system.

---

## ?? Project Overview

Bubble Basket Laundry is a complete business management suite with a customer-facing mobile-ready web app, staff Kanban board, rider delivery interface, and admin dashboard with full analytics.

### Key Features

| Role | Features |
|------|----------|
| **Client** | OTP login, place orders (per-kg, duvets, special items), real-time order tracking, M-PESA STK push, loyalty stamps, referral codes, subscription plans, profile management |
| **Shop Staff** | Kanban board (New ? Picked Up ? Washing ? Drying ? Ready), status transitions, rider assignment |
| **Rider** | View assigned ready orders, mark deliveries, see payment status |
| **Admin** | Revenue analytics, inventory management, promotions (promo codes), pricing management, branding editor, payments overview, customer segmentation |

---

## ?? Technology Stack

### Backend (Python)
- **Django 4.2** + Django REST Framework
- **JWT Authentication** (with OTP via Twilio)
- **SQLite** (local) / **PostgreSQL** (production)
- **Celery** + **Redis** (background tasks – optional)
- **Django Channels** (WebSocket real-time updates – optional)

### Frontend (React)
- **React 18** + **Vite** (fast build)
- **React Router v6** (role-based routing)
- **Axios** (API client with interceptors)
- **Tailwind CSS** (custom brand theme)
- **Lucide Icons** (clean, scalable icons)
- **Native WebSockets** (real-time order tracking)

### Integrations
- **Twilio** – OTP via SMS
- **M-PESA Daraja API** – STK Push payments
- **WhatsApp** (floating chat button)

---

## ?? Brand Theme

A playful, modern identity built around:
- **Primary:** Bubble Pink \#FF1E75\
- **Structural:** Deep Indigo \#0E1B4D\
- **Secondary:** Sky Blue \#2D8EFF\
- **Background:** Soft Lavender \#FFEBF2\
- **M-PESA:** Magenta \#E41C24\
- **WhatsApp:** Green \#25D366\

Typography: **Fredoka One** (headings) + **Poppins** (body).

---

## ?? Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- (Optional) PostgreSQL, Redis

---

### 1. Clone the Repository

\\\ash
git clone https://github.com/yourusername/bubble-basket-laundry.git
cd bubble-basket-laundry
\\\

### 2. Backend Setup
\\\ash
cd laundry_backend
python -m venv venv
# On Windows:
.\\venv\\Scripts\\activate
pip install -r requirements.txt
\\\

#### Environment Variables
Create a \.env\ file based on \.env.example\ and fill in your keys:

\\\env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Twilio (OTP)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# M-PESA Daraja
MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
MPESA_SHORTCODE=174379
MPESA_PASSKEY=xxx
MPESA_CALLBACK_URL=http://localhost:8000/api/payments/mpesa-callback/
\\\

#### Migrations & Superuser
\\\ash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
\\\

#### Seed Sample Data
\\\ash
python manage.py shell < seed.py
\\\

#### Run Backend
\\\ash
python manage.py runserver
\\\
Server runs at http://localhost:8000.

---

### 3. Frontend Setup
\\\ash
cd ../frontend
npm install
\\\

#### Environment Variables
Create \.env\ in the frontend root:

\\\env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
\\\

#### Run Frontend
\\\ash
npm run dev
\\\
App runs at http://localhost:3000.

---

## ?? Default Test Accounts

| Role | Phone Number |
|---|---|
| **Admin** | 254700000001 |
| **Shop Staff** | 254700000002 |
| **Rider** | 254700000003 |
| **Client** | 254712345678 |

*OTP is printed in the backend terminal (SMS disabled in development).*

---

## ?? Project Structure
\\\	ext
bubble-basket-laundry/
+-- laundry_backend/          # Django backend
¦   +-- core/                 # Project settings
¦   +-- apps/
¦   ¦   +-- users/            # Auth, profiles, roles
¦   ¦   +-- orders/           # Order models, Kanban logic
¦   ¦   +-- payments/         # M-PESA integration
¦   ¦   +-- admin_tools/      # Inventory, promos, branding, pricing
¦   +-- manage.py
¦   +-- requirements.txt
¦
+-- frontend/                 # React frontend
    +-- src/
    ¦   +-- api/              # Axios client
    ¦   +-- components/       # Reusable UI
    ¦   +-- context/          # Auth provider
    ¦   +-- hooks/            # useAuth, useWebSocket
    ¦   +-- pages/
    ¦   ¦   +-- Client/       # Dashboard, NewOrder, Tracker, Subscriptions
    ¦   ¦   +-- Staff/        # Kanban board
    ¦   ¦   +-- Rider/        # Delivery dashboard
    ¦   ¦   +-- Admin/        # Analytics, Inventory, Pricing, Payments
    ¦   +-- App.jsx
    +-- package.json
    +-- tailwind.config.js
\\\

---

## ?? License
This project is proprietary and confidential. All rights reserved.

## ?? Contact
Bubble Basket Laundry – 0793 272 588  
Location – Daystar, Athi River
