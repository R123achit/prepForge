# PrepForge Backend - MERN Stack

Complete backend implementation for PrepForge interview preparation platform built with MongoDB, Express.js, and Node.js.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (CANDIDATE, INTERVIEWER, ADMIN)
- **AI-Powered Interviews**: Create and manage AI mock interviews with instant feedback
- **Live Interviews**: Schedule and conduct real-time interviews with human interviewers
- **Resume Analysis**: AI-powered resume parsing and job matching
- **Chatbot**: Intelligent assistant for interview preparation guidance
- **Dashboard**: Unified dashboard with role-specific data
- **File Upload**: Secure resume upload with validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher) - Running locally or MongoDB Atlas
- npm or yarn

## 🛠️ Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env` or use the existing `.env` file
   - Update MongoDB URI if needed
   - (Optional) Add AI API keys for Groq or OpenAI

3. **Make sure MongoDB is running**:
   - **Local MongoDB**: Start MongoDB service
   - **MongoDB Atlas**: Update `MONGODB_URI` in `.env` with your connection string

## 🎯 Usage

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:8000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── AIInterview.js       # AI Interview model
│   │   ├── LiveInterview.js     # Live Interview model
│   │   └── Resume.js            # Resume model
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── aiInterviews.js      # AI interview routes
│   │   ├── liveInterviews.js    # Live interview routes
│   │   ├── dashboard.js         # Dashboard routes
│   │   ├── resumes.js           # Resume routes
│   │   ├── chatbot.js           # Chatbot routes
│   │   └── users.js             # User routes
│   ├── services/
│   │   └── aiService.js         # AI integration service
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   └── server.js                # Main server file
├── uploads/                     # File uploads directory
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### AI Interviews
- `POST /api/ai-interviews` - Create AI interview (protected)
- `GET /api/ai-interviews` - Get user's AI interviews (protected)
- `GET /api/ai-interviews/:id` - Get specific interview (protected)
- `POST /api/ai-interviews/:id/responses` - Submit response (protected)
- `POST /api/ai-interviews/:id/complete` - Complete interview (protected)
- `DELETE /api/ai-interviews/:id` - Delete interview (protected)

### Live Interviews
- `POST /api/live-interviews` - Schedule interview (candidate only)
- `GET /api/live-interviews` - Get interviews (role-based)
- `GET /api/live-interviews/:id` - Get specific interview
- `POST /api/live-interviews/:id/accept` - Accept interview (interviewer only)
- `POST /api/live-interviews/:id/start` - Start interview
- `POST /api/live-interviews/:id/complete` - Complete interview (interviewer only)
- `POST /api/live-interviews/:id/cancel` - Cancel interview
- `DELETE /api/live-interviews/:id` - Delete interview

### Dashboard
- `GET /api/dashboard/unified` - Get unified dashboard data (protected)
- `GET /api/dashboard/stats` - Get user statistics (protected)
- `GET /api/dashboard/activity` - Get recent activity (protected)

### Resumes
- `POST /api/resumes/upload` - Upload resume for analysis (protected)
- `GET /api/resumes` - Get user's resumes (protected)
- `GET /api/resumes/:id` - Get resume analysis (protected)
- `DELETE /api/resumes/:id` - Delete resume (protected)

### Chatbot
- `POST /api/chatbot` - Send message to chatbot (protected)
- `GET /api/chatbot/history` - Get chat history (protected)

### Users
- `GET /api/users/lookup?email=...` - Lookup user by email
- `GET /api/users/interviewers` - Get available interviewers

### System
- `GET /health` - Health check endpoint
- `GET /` - API information

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🎭 User Roles

- **CANDIDATE**: Can take AI interviews, schedule live interviews, upload resumes
- **INTERVIEWER**: Can accept interview requests, conduct interviews, provide feedback
- **ADMIN**: Full access to all features (future implementation)

## 🤖 AI Integration

The backend supports two AI providers:

1. **Groq API** (Recommended - Faster, Free tier available)
   - Get API key: https://console.groq.com/
   - Set `GROQ_API_KEY` in `.env`

2. **OpenAI API** (Alternative)
   - Get API key: https://platform.openai.com/
   - Set `OPENAI_API_KEY` in `.env`

If no API keys are configured, the system uses mock responses for development.

## 📦 Database Setup

### Option 1: Local MongoDB

1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use default connection: `mongodb://localhost:27017/prepforge`

### Option 2: MongoDB Atlas (Cloud)

1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prepforge?retryWrites=true&w=majority
```

## 🧪 Testing

Test the API using:

- **Postman**: Import endpoints and test
- **Thunder Client** (VS Code): REST API testing
- **cURL**: Command line testing

Example cURL request:
```bash
# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CANDIDATE"
  }'
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, whitelist your IP address

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill process using port 8000

### File Upload Error
- Ensure `uploads` directory exists and has write permissions
- Check `MAX_FILE_SIZE` in `.env`

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 8000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/prepforge |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | Token expiry | 7d |
| `GROQ_API_KEY` | Groq AI API key | (optional) |
| `OPENAI_API_KEY` | OpenAI API key | (optional) |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 5242880 (5MB) |
| `UPLOAD_DIR` | Upload directory | ./uploads |

## 🚀 Deployment

### Deploy to Production

1. Set `NODE_ENV=production` in environment
2. Use a production MongoDB instance
3. Set strong `JWT_SECRET`
4. Configure proper CORS origins
5. Use environment-specific configs

### Recommended Hosting Platforms

- **Backend**: Heroku, Railway, Render, DigitalOcean
- **Database**: MongoDB Atlas, AWS DocumentDB

## 📄 License

ISC

## 👥 Support

For issues and questions:
- Email: prepforge563@gmail.com
- Phone: +91 7232915352

---

Built with ❤️ for PrepForge Interview Preparation Platform
