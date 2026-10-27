# Wrist Wonders - Node.js & MongoDB Backend

A full-stack backend built with **Node.js**, **Express**, and **MongoDB (Mongoose)** for the Wrist Wonders watch store.

---

## 🚀 Features

- **Express REST API**: Fast, modular routing for authentication, queries, products, and orders.
- **MongoDB Database**: Persistent document database using Mongoose ODM schemas.
- **User Authentication**:
  - Secure password hashing using `bcryptjs`.
  - JWT (JSON Web Token) authentication for protected routes.
  - Integration with `sign up.html` and `log-in.html`.
- **Contact & Feedback System**:
  - Connected to `QUERY.HTML` to store queries directly in MongoDB.
- **Product Catalog Management**:
  - Watches and accessories stored by category (Mens, Womens, Kids, Smart, Analog, Accessories).
- **Order Processing**:
  - Cart checkout and order tracking in MongoDB.
- **Interactive Backend Dashboard**:
  - Built-in admin portal at [`/dashboard.html`](http://localhost:5000/dashboard.html) to inspect database collections, test APIs, and manage products.
- **Static File Serving**:
  - Seamlessly serves the existing HTML, CSS, images, and JavaScript files directly from Express.

---

## 📁 Project Structure

```
d:\ww\
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   ├── authController.js     # Signup, login, user management
│   ├── orderController.js    # Order placement & retrieval
│   ├── productController.js  # Product catalog CRUD
│   └── queryController.js    # Customer query & feedback handler
├── middleware/
│   ├── authMiddleware.js     # JWT verification & admin guard
│   └── errorMiddleware.js    # 404 & error handlers
├── models/
│   ├── Order.js              # Order schema & items
│   ├── Product.js            # Watch product schema
│   ├── Query.js              # Contact/query schema
│   └── User.js               # User schema with bcrypt hashing
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── orderRoutes.js        # /api/orders routes
│   ├── productRoutes.js      # /api/products routes
│   └── queryRoutes.js        # /api/queries routes
├── js/
│   └── api.js                # Frontend AJAX client & auth helper
├── dashboard.html            # Backend Admin Portal & API Explorer
├── server.js                 # Main Express server entry point
├── seed.js                   # Database seeder script
├── .env                      # Environment configuration
├── .env.example              # Example environment configuration
├── package.json              # Project dependencies & scripts
└── ... (HTML, CSS, Image assets)
```

---

## 🛠️ Quick Start

### ⚡ One-Click Start (Windows)
Double-click `start.bat` in the project root:
- Checks & starts MongoDB automatically
- Verifies npm dependencies
- Starts the Node.js Express server
- Opens `http://localhost:5000` directly in your default browser!

---

### Manual Setup

#### 1. Prerequisites
Ensure MongoDB is running locally (or run `npm run mongo:start`):
- MongoDB URI: `mongodb://127.0.0.1:27017/wrist_wonders`
- Or specify your remote MongoDB Atlas connection string in `.env`.

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Seed Sample Data into MongoDB
Populates initial products, categories, sample queries, and demo accounts:
```bash
npm run seed
```

#### 4. Start the Backend Server
```bash
# Production mode
npm start

# Development mode with hot-reload (nodemon)
npm run dev
```

### 5. Access the Application
- **Storefront**: [http://localhost:5000](http://localhost:5000)
- **Backend Admin Portal**: [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register new user with name, email, password |
| `POST` | `/api/auth/login` | Login with username/email and password, returns JWT token |
| `GET` | `/api/auth/me` | Get logged-in user profile (Requires Bearer token) |
| `GET` | `/api/auth/users` | List all registered users (for admin inspection) |

### Queries & Contact (`/api/queries`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/queries` | Submit contact/query message to MongoDB |
| `GET` | `/api/queries` | Get all submitted queries |
| `DELETE` | `/api/queries/:id` | Delete query by ID |

### Products (`/api/products`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get products (filter: `?category=mens`, `?search=titan`) |
| `GET` | `/api/products/:id` | Get single product details |
| `POST` | `/api/products` | Create a new watch product |
| `PUT` | `/api/products/:id` | Update product details |
| `DELETE` | `/api/products/:id` | Delete product by ID |

### Orders (`/api/orders`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Place a new order with items and customer info |
| `GET` | `/api/orders` | Get all orders |
| `GET` | `/api/orders/:id` | Get single order by ID |
| `PUT` | `/api/orders/:id/status` | Update order status |

---

## 🔑 Default Accounts (from Seeder)
- **Admin**: `admin@wristwonders.com` / `adminPassword123`
- **Customer**: `john@example.com` / `password123`
