# Quick Setup Guide

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended for Hackathons)

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)** and sign up for free
2. **Create a new cluster** (choose the free M0 tier)
3. **Set up database access:**
   - Create a database user with username/password
   - Add your IP address to the IP whitelist (or use 0.0.0.0/0 for all IPs)
4. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

5. **Create backend/.env file:**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/qa-platform?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

### Option 2: Local MongoDB

1. **Download MongoDB Community Server** from [mongodb.com](https://www.mongodb.com/try/download/community)
2. **Install and start MongoDB**
3. **Create backend/.env file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/qa-platform
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

## Running the Application

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Quick Test

1. Open http://localhost:3000
2. Click "Get Started Free" to register
3. Create an account and start using the platform!

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running
- Check your connection string in backend/.env
- Verify your IP is whitelisted (for Atlas)

### Frontend Issues
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify .env.local file exists in frontend directory 