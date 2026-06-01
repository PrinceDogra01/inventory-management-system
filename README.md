# 📦 InvenFlow — Inventory & Order Management System

A production-ready, fully containerized Inventory & Order Management System built with React, FastAPI, and PostgreSQL.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy 2 + Pydantic v2 |
| Container | Docker + Docker Compose |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

## ✨ Features

- **Products** — Full CRUD with SKU uniqueness, stock tracking, status badges
- **Customers** — Full CRUD with unique email validation
- **Orders** — Create multi-item orders with automatic stock reduction & total calculation
- **Dashboard** — Real-time metrics: total products, customers, orders, low stock alerts
- **Business Rules** — Stock validation, insufficient inventory rejection, stock restore on cancel
- **Responsive UI** — Works on mobile and desktop

## 🏃 Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Run with Docker Compose

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system

# Copy environment file
cp .env.example .env  # Edit credentials as needed

# Start all services
docker compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```



## 📡 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/` | List all products |
| POST | `/products/` | Create product |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/` | List all customers |
| POST | `/customers/` | Create customer |
| GET | `/customers/{id}` | Get customer |
| PUT | `/customers/{id}` | Update customer |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/` | List all orders |
| POST | `/orders/` | Create order |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/` | Get summary stats |

## 🌐 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

### Backend → Render
1. Push to GitHub
2. Create new **Web Service** on Render
3. Root directory: `backend`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add PostgreSQL database via **render.yaml** or manually

### Backend → Docker Hub
```bash
cd backend
docker build -t YOUR_USERNAME/inventory-backend:latest .
docker push YOUR_USERNAME/inventory-backend:latest
```

## 🗄️ Database Schema

```
products         customers        orders           order_items
---------        ---------        ------           -----------
id               id               id               id
name             name             customer_id →    order_id →
sku (unique)     email (unique)   status           product_id →
description      phone            total_amount     quantity
price            address          notes            unit_price
quantity         created_at       created_at       subtotal
created_at
updated_at
```

## 🔒 Business Rules Implemented

- ✅ Product SKU must be unique
- ✅ Customer email must be unique
- ✅ Product quantity cannot go negative
- ✅ Orders rejected if stock is insufficient
- ✅ Stock automatically reduced on order creation
- ✅ Stock automatically restored on order cancellation
- ✅ Order total calculated automatically by backend
- ✅ All inputs validated before processing

## 📁 Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── core/database.py
│   │   ├── models/models.py
│   │   ├── schemas/schemas.py
│   │   ├── routers/
│   │   │   ├── products.py
│   │   │   ├── customers.py
│   │   │   ├── orders.py
│   │   │   └── dashboard.py
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/api.js
│   │   └── App.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vercel.json
├── docker-compose.yml
├── render.yaml
└── README.md
```

