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



### Technical Excellence
- **TypeScript**: Full type safety across frontend and backend
- **Responsive Design**: Mobile-first approach with beautiful UI/UX
- **Performance**: Optimized with React Query, lazy loading, and efficient caching
- **Security**: rate limiting, input validation

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
- MongoDB (Atlas)
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
   ```Orginal env file psuhed for evaluation purpose
   ```

4. **Configure environment variables:**
   ```wana use your credantial?  then add this and edit url.
   env
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
   ```
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


### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get question by ID
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question

### Answers
- `POST /api/answers` - Create answer
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
- Ask a question: +10 points
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


## 📄 License

This project is licensed under the MIT License.

