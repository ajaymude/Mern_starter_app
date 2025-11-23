# MERN Stack Starter Project

A production-ready MERN (MongoDB, Express, React, Node.js) starter project with authentication, protected routes, and industry-standard best practices.

## Features

### Core Features
- ✅ **User Authentication** - Login, Signup, and Logout functionality
- ✅ **Protected Routes** - Secure routes that require authentication
- ✅ **Redux Toolkit with RTK Query** - Modern state management and API handling
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Production Ready** - Build configuration to serve React app from Express
- ✅ **Modern UI** - Clean and responsive user interface
- ✅ **Industry Standard Structure** - Well-organized folder structure

### Production & Security Features (Optimized for 10M+ Daily Users)
- ✅ **Centralized Logging** - Winston logger with daily file rotation and structured logging
- ✅ **Async Error Handling** - Async wrapper eliminates try-catch blocks
- ✅ **Security Middleware** - Helmet, rate limiting, XSS protection, MongoDB sanitization
- ✅ **Request Validation** - Express-validator with strong password requirements
- ✅ **Database Optimization** - Connection pooling (50 max, 5 min connections)
- ✅ **Compression** - Gzip compression for all responses
- ✅ **Rate Limiting** - API and auth route protection
- ✅ **Monitoring** - Health check and system metrics endpoints
- ✅ **Error Tracking** - Comprehensive error logging with context
- ✅ **Multi-Platform Auth** - Supports React.js (cookies) and React Native (tokens)
- ✅ **Automatic Client Detection** - Detects web vs mobile automatically
- ✅ **Refresh Tokens** - Token refresh support for long sessions

## Project Structure

```
mern-starter/
├── server/                 # Backend (Express + MongoDB)
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware (auth, error handling)
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── app.js            # Express app configuration
│   └── index.js          # Server entry point
├── client/               # Frontend (React + Redux)
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store and slices
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # React entry point
│   └── build/            # Production build (generated)
└── package.json          # Root package.json with convenience scripts
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone or download this project**

2. **Install dependencies for both server and client:**
   ```bash
   npm run install-all
   ```
   
   Or install separately:
   ```bash
   # Install server dependencies
   npm run install-server
   
   # Install client dependencies
   npm run install-client
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern-starter
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   ```

## Running the Application

### Development Mode

Run both server and client concurrently:
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Start server
npm run server

# Terminal 2 - Start client
npm run client
```

- Server will run on: `http://localhost:5000`
- Client will run on: `http://localhost:3000`

### Production Mode

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Start the server (it will serve the built React app):**
   ```bash
   npm run start:prod
   ```

   The server will serve both the API and the React app from `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users/profile` - Get user profile (Protected)

## Usage

1. **Sign Up:** Navigate to `/signup` and create a new account
2. **Login:** Use your credentials to login at `/login`
3. **Dashboard:** After login, you'll be redirected to the protected `/dashboard` route
4. **Logout:** Click the logout button in the navbar

## Technologies Used

### Backend
- Express.js - Web framework
- MongoDB with Mongoose - Database (optimized connection pooling)
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing
- Morgan - HTTP request logger
- Winston - Centralized logging with file rotation
- Helmet - Security headers
- express-rate-limit - Rate limiting
- express-mongo-sanitize - NoSQL injection protection
- xss-clean - XSS protection
- compression - Response compression
- express-validator - Request validation
- dotenv - Environment variables

### Frontend
- React 18 - UI library
- Redux Toolkit - State management
- RTK Query - Data fetching and caching
- React Router - Routing
- Vite - Build tool

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Protected React routes
- CORS configuration
- Input validation with express-validator
- Rate limiting (API and auth routes)
- Helmet security headers
- XSS protection
- NoSQL injection protection
- HTTP Parameter Pollution protection
- Request size limits
- Comprehensive error handling
- Centralized logging for security audits

## Customization

### Adding New Routes

1. **Backend:** Create a new route file in `server/routes/` and add it to `server/app.js`
2. **Frontend:** Add new routes in `client/src/App.jsx`

### Adding New API Endpoints

1. Create controller in `server/controllers/`
2. Create route in `server/routes/`
3. Add RTK Query endpoint in `client/src/store/api/`

## Production Deployment

For production deployment with high traffic (10M+ daily users), see [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) for:
- Detailed security configuration
- Performance optimizations
- Scaling recommendations
- Monitoring setup
- Database optimization

## Logging

Logs are automatically created in `server/logs/`:
- `application-*.log` - General application logs
- `error-*.log` - Error logs (30 day retention)
- `exceptions-*.log` - Uncaught exceptions (30 day retention)
- `rejections-*.log` - Unhandled promise rejections (30 day retention)

## Monitoring Endpoints

- `GET /api/monitoring/health` - Health check
- `GET /api/monitoring/metrics` - System metrics (memory, CPU, uptime)

## Contributing

Feel free to fork this project and customize it for your needs!

## License

ISC

