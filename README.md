# Problem Statement: StackIt – A Minimal Q&A Forum Platform Team Name: Etcetera Team Email Address: kcabsher@gmail.com

# QA Platform - Learn, Share, and Grow Together

A comprehensive Q&A platform built with Next.js, TypeScript, and Node.js that features gamification, anonymous posting, real-time notifications, rich text editing, and a vibrant learning community.

## 🚀 Features

### Core Features
- **Rich Q&A Experience**: Ask questions with rich text formatting, code blocks, images, and attachments
- **Voting System**: Upvote/downvote questions and answers with real-time updates
- **Answer Acceptance**: Mark the best answer for your questions
- **Tagging System**: Organize content with tags and categories
- **Search & Discovery**: Powerful search with filters and sorting options
- **Comment System**: Add comments to questions and answers for discussions
- **Rich Text Editor**: Full-featured editor with formatting, emojis, links, and image uploads

### User Management & Profiles
- **User Authentication**: Secure login/register with JWT tokens
- **User Profiles**: Detailed profiles with bio, stats, and activity history
- **Settings Management**: Profile settings, password changes, and notification preferences
- **User Dashboard**: Personal dashboard with questions, answers, and achievements

### Gamification & Engagement
- **StackPoints System**: Earn points for asking questions, answering, and helping others
- **Achievement System**: Unlock badges like "Answer Streak 🔥", "Problem Solver 🧠", "Confidence Booster 🌟"
- **User Levels**: Progress from Beginner to Master based on StackPoints
- **Leaderboard**: Compete with other users and see top performers across different categories

### Anonymous Q&A Mode
- **Confidence Building**: Allow shy learners to post anonymously
- **Confidence Booster Badge**: Special recognition when anonymous answers are accepted
- **Moderation Support**: Anonymous posts are subject to moderation

### Real-time Features
- **Live Notifications**: Get instant updates for answers, upvotes, achievements
- **Socket.IO Integration**: Real-time communication and updates
- **Activity Tracking**: Monitor user engagement and platform activity

### Content Management
- **Question Categories**: Organize questions by programming, design, business, etc.
- **Tag Suggestions**: Intelligent tag suggestions based on popular tags
- **Content Moderation**: Admin tools for managing content and users
- **Search & Filters**: Advanced search with category, status, and tag filters

### Technical Excellence
- **TypeScript**: Full type safety across frontend and backend
- **Responsive Design**: Mobile-first approach with beautiful UI/UX
- **Performance**: Optimized with efficient caching and lazy loading
- **Security**: Rate limiting, input validation, and secure authentication
- **Accessibility**: WCAG compliant design with proper ARIA labels

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling with validation
- **Context API** - State management for authentication and user data
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Beautiful icons
- **Rich Text Editor** - Custom contenteditable editor with formatting tools

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email notifications
- **CORS** - Cross-origin resource sharing

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
   ```orginal env pushed for valuation purpose.
   ```

4. **Configure environment variables:**
   ```wana use own credentials? then copy paste this and change urls.
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
   ```bash
   cp .env.example .env
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
│   ├── models/          # MongoDB schemas (User, Question, Answer, Comment)
│   ├── routes/          # API endpoints (auth, questions, answers, users, admin)
│   ├── middleware/      # Authentication & validation
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   │   ├── ask/     # Ask question page
│   │   │   ├── questions/ # Question listing and detail pages
│   │   │   ├── login/   # Authentication pages
│   │   │   ├── register/
│   │   │   ├── dashboard/ # User dashboard
│   │   │   ├── profile/ # User profile pages
│   │   │   ├── settings/ # User settings
│   │   │   ├── search/  # Search functionality
│   │   │   └── leaderboard/ # Leaderboard page
│   │   ├── components/  # Reusable React components
│   │   │   ├── RichTextEditor.tsx # Rich text editor component
│   │   │   ├── Navigation.tsx # Navigation component
│   │   │   └── ...      # Other UI components
│   │   ├── contexts/    # React contexts (AuthContext)
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Questions
- `GET /api/questions` - Get all questions with pagination and filters
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get question by ID
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question
- `POST /api/questions/:id/comments` - Add comment to question
- `DELETE /api/questions/:id/comments/:commentId` - Remove comment from question

### Answers
- `POST /api/questions/:id/answers` - Create answer for question
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer
- `POST /api/answers/:id/comments` - Add comment to answer
- `DELETE /api/answers/:id/comments/:commentId` - Remove comment from answer

### Users
- `GET /api/users/profile/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/leaderboard` - Get leaderboard data
- `GET /api/users/search` - Search users

### Search
- `GET /api/search` - Search questions with filters

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user

## 🎨 Key Features Demo

### Rich Text Editor
- **Formatting Tools**: Bold, italic, strikethrough, lists, alignment
- **Media Support**: Insert images via URL or file upload
- **Emoji Picker**: Add emojis to your content
- **Link Insertion**: Add hyperlinks with custom text
- **Real-time Preview**: See formatting as you type

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

### Comment System
- Add comments to questions and answers
- Real-time comment updates
- Character limits and validation
- Nested comment support

### Search & Discovery
- Full-text search across questions
- Filter by category, status, and tags
- Sort by relevance, date, votes, and answers
- Tag suggestions and autocomplete

### User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Text Visibility**: All text areas have proper contrast and visibility
- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Smooth loading indicators and skeleton screens
- **Error Handling**: Graceful error handling with user-friendly messages

## 🚀 Recent Updates

### Version 1.0.0 - Complete Platform
- ✅ Rich text editor with full formatting capabilities
- ✅ Comment system for questions and answers
- ✅ Advanced search with filters and pagination
- ✅ User settings and profile management
- ✅ Leaderboard with multiple categories
- ✅ Anonymous posting mode
- ✅ Voting system with real-time updates
- ✅ Answer acceptance functionality
- ✅ Tag system with suggestions
- ✅ Responsive design for all devices
- ✅ Dark text visibility fixes
- ✅ Form validation and error handling
- ✅ Real-time notifications (Socket.IO ready)
- ✅ Admin dashboard and moderation tools

## 📄 License

This project is licensed under the MIT License.



