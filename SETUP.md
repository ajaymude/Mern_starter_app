# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm run install-all
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cd server
   copy env.example .env
   ```
   (On Linux/Mac: `cp env.example .env`)

2. Edit `server/.env` and update the following:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong secret key for JWT tokens

## Step 3: Start MongoDB

Make sure MongoDB is running on your system or update the `MONGODB_URI` in `.env` to point to your MongoDB instance (e.g., MongoDB Atlas).

## Step 4: Run the Application

### Development Mode (Recommended for first run)
```bash
npm run dev
```

This will start both the server (port 5000) and client (port 3000).

### Production Mode

1. Build the React app:
   ```bash
   npm run build
   ```

2. Start the server (it will serve the built React app):
   ```bash
   npm run start:prod
   ```

## Step 5: Test the Application

1. Open your browser and go to `http://localhost:3000` (development) or `http://localhost:5000` (production)
2. Click "Sign Up" to create a new account
3. After signing up, you'll be automatically logged in and redirected to the dashboard
4. Try logging out and logging back in

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `server/.env`
- For MongoDB Atlas, make sure your IP is whitelisted

### Port Already in Use
- Change the `PORT` in `server/.env` for the server
- Change the port in `client/vite.config.js` for the client

### Build Errors
- Make sure all dependencies are installed: `npm run install-all`
- Delete `node_modules` and reinstall if needed

