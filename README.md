# QA Platform - Learn, Share, and Grow Together

A comprehensive Q&A platform built with Next.js, TypeScript, and Node.js that features gamification, anonymous posting, real-time notifications, and a vibrant learning community.

## 🚀 Features

### Core Features
- **Rich Q&A Experience**: Ask questions with rich text formatting, code blocks, images, and attachments
- **Voting System**: Upvote/downvote questions and answers
- **Answer Acceptance**: Mark the best answer for your questions
- **Tagging System**: Organize content with tags and categories
- **Search & Discovery**: Powerful search with filters and sorting options

### Gamification & Engagement
- **StackPoints System**: Earn points for asking questions, answering, and helping others
- **Achievement System**: Unlock badges like "Answer Streak 🔥", "Problem Solver 🧠", "Confidence Booster 🌟"
- **User Levels**: Progress from Beginner to Master based on StackPoints
- **Leaderboard**: Compete with other users and see top performers

### Anonymous Q&A Mode
- **Confidence Building**: Allow shy learners to post anonymously
- **Confidence Booster Badge**: Special recognition when anonymous answers are accepted
- **Moderation Support**: Anonymous posts are subject to moderation

### Real-time Features
- **Live Notifications**: Get instant updates for answers, upvotes, achievements
- **Socket.IO Integration**: Real-time communication and updates
- **Activity Tracking**: Monitor user engagement and platform activity

### Admin & Moderation
- **Admin Dashboard**: Comprehensive analytics, user management, and moderation tools
- **User Management**: Ban/unban users, change roles, monitor activity
- **Content Moderation**: Review and moderate questions and answers
- **Analytics**: Detailed platform usage statistics and trends

### Technical Excellence
- **TypeScript**: Full type safety across frontend and backend
- **Responsive Design**: Mobile-first approach with beautiful UI/UX
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized with React Query, lazy loading, and efficient caching
- **Security**: JWT authentication, rate limiting, input validation

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling with validation
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image hosting
- **Nodemailer** - Email notifications

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/qa-platform
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.local.example .env.local
   ```

4. **Configure environment variables:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   NEXT_PUBLIC_APP_NAME=QA Platform
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🎯 Quick Start

1. **Start MongoDB** (if using local instance)
2. **Start backend server** (`cd backend && npm run dev`)
3. **Start frontend** (`cd frontend && npm run dev`)
4. **Visit** `http://localhost:3000`
5. **Register** a new account and start exploring!

## 📁 Project Structure

```
qa-platform/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Authentication & validation
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # Reusable React components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get question by ID
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question

### Answers
- `POST /api/answers` - Create answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer

### Users
- `GET /api/users/profile/:username` - Get user profile
- `GET /api/users/leaderboard` - Get leaderboard

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user

## 🎨 Key Features Demo

### StackPoints & Gamification
- Ask a question: +5 points
- Answer a question: +10 points
- Get upvoted: +2 points (question) / +5 points (answer)
- Have answer accepted: +15 points
- Unlock achievements for milestones

### Anonymous Posting
- Toggle anonymous mode when asking/answering
- Anonymous posts are tracked for Confidence Booster badge
- Moderation tools for anonymous content

### Real-time Features
- Live notifications for answers, upvotes, achievements
- Real-time chat and activity updates
- Instant feedback on actions

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or other cloud database
2. Configure environment variables for production
3. Deploy to Heroku, Railway, or your preferred platform

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎉 Hackathon Ready

This project is optimized for hackathon presentations with:
- **Impressive UI/UX** with smooth animations
- **Demo-friendly features** that showcase technical excellence
- **Production-ready code** with proper error handling
- **Comprehensive documentation** for judges
- **Scalable architecture** for future development

## 🆘 Support

For support, email support@qaplatform.com or create an issue in the repository.

---

**Built with ❤️ for the developer community** 