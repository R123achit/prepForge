# PrepForge - Complete Setup Guide

## 🎯 Quick Start Guide

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- npm or yarn

---

## 📦 Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Backend Environment

Edit `backend/.env` file:

```env
# MongoDB - Choose one option:

# Option A: Local MongoDB (if MongoDB is installed locally)
MONGODB_URI=mongodb://localhost:27017/prepforge

# Option B: MongoDB Atlas (cloud database)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prepforge

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# AI API Keys (Optional - for AI features)
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Configure Frontend Environment

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:8000`

### Start Frontend Application

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 📊 MongoDB Setup

### Option 1: Local MongoDB

1. **Install MongoDB**: 
   - Windows: https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **Start MongoDB**:
   - Windows: MongoDB runs as a service automatically
   - Mac/Linux: `mongod` or `sudo systemctl start mongodb`

3. **Verify**: 
   ```bash
   mongosh
   # Should connect successfully
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended)

1. **Create Account**: https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**: 
   - Choose free tier (M0)
   - Select your region
   - Create cluster (takes 3-5 minutes)
3. **Setup Database Access**:
   - Database Access → Add New Database User
   - Create username and password
   - Set role to "Read and write to any database"
4. **Setup Network Access**:
   - Network Access → Add IP Address
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `prepforge`
6. **Update backend/.env**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prepforge?retryWrites=true&w=majority
   ```

---

## 🔑 AI API Keys (Optional but Recommended)

### Get Groq API Key (Free & Fast)

1. Go to https://console.groq.com/
2. Sign up for a free account
3. Navigate to API Keys section
4. Create new API key
5. Add to `backend/.env`:
   ```env
   GROQ_API_KEY=your_key_here
   ```

### Get OpenAI API Key (Alternative)

1. Go to https://platform.openai.com/
2. Sign up / Login
3. Navigate to API Keys
4. Create new secret key
5. Add to `backend/.env`:
   ```env
   OPENAI_API_KEY=your_key_here
   ```

**Note**: If you don't add API keys, the system will use mock responses for AI features (good for testing).

---

## 🧪 Testing the Setup

### 1. Test Backend

```bash
curl http://localhost:8000/health
```

Should return: `{"status":"ok", ...}`

### 2. Test Frontend

Open browser: `http://localhost:5173`

You should see the PrepForge landing page.

### 3. Create Test Account

1. Click "Get Started" or "Register"
2. Fill in the registration form
3. Choose role: Candidate or Interviewer
4. Submit

### 4. Test Features

**For Candidates**:
- Start AI Interview
- Schedule Live Interview
- Upload Resume
- Use Chatbot

**For Interviewers**:
- View Interview Requests
- Accept Interviews
- Practice with AI

---

## 📁 Project Structure

```
PrepForge/
├── backend/                 # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Authentication, validation
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI service integration
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Main server file
│   ├── uploads/            # File uploads
│   ├── .env                # Environment variables
│   ├── package.json        # Dependencies
│   └── README.md           # Backend documentation
│
└── frontend/               # React + Vite + TailwindCSS
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── pages/          # Page components
    │   ├── services/       # API service
    │   ├── store/          # State management
    │   ├── types/          # TypeScript types
    │   └── App.tsx         # Main app component
    ├── .env                # Frontend environment
    ├── package.json        # Dependencies
    └── README.md           # Frontend documentation
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "MongoDB connection failed"**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- For Atlas, check network access and credentials

**Error: "Port 8000 already in use"**
- Change `PORT` in `backend/.env`
- Or kill the process: `npx kill-port 8000`

**Error: "Cannot find module"**
- Run `npm install` in backend directory

### Frontend won't start

**Error: "Cannot connect to backend"**
- Ensure backend is running on port 8000
- Check `VITE_API_URL` in `frontend/.env`

**Error: "Module not found"**
- Run `npm install` in frontend directory
- Clear node_modules: `rm -rf node_modules && npm install`

### Database Issues

**Collections not created**
- Collections are created automatically when first data is inserted
- Try registering a user

**Data not showing**
- Check if user is logged in
- Check browser console for errors
- Verify JWT token is being sent

---

## 🔐 Security Notes

### For Development
- Default credentials are fine
- JWT_SECRET can be simple

### For Production
- Change `JWT_SECRET` to a strong random string
- Use environment-specific `.env` files
- Enable HTTPS
- Restrict CORS to your domain
- Use MongoDB Atlas with IP whitelist
- Add rate limiting
- Enable API authentication
- Sanitize user inputs

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
All protected endpoints require Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

**Authentication**
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get profile
- `PUT /auth/profile` - Update profile

**AI Interviews**
- `POST /ai-interviews` - Create interview
- `GET /ai-interviews` - List interviews
- `POST /ai-interviews/:id/responses` - Submit answer
- `POST /ai-interviews/:id/complete` - Complete interview

**Live Interviews**
- `POST /live-interviews` - Schedule interview
- `GET /live-interviews` - List interviews
- `POST /live-interviews/:id/accept` - Accept (interviewer)
- `POST /live-interviews/:id/complete` - Complete (interviewer)

**Dashboard**
- `GET /dashboard/unified` - Get dashboard data
- `GET /dashboard/stats` - Get statistics

**Resumes**
- `POST /resumes/upload` - Upload resume
- `GET /resumes/:id` - Get analysis

**Chatbot**
- `POST /chatbot` - Send message

---

## 🎓 Next Steps

1. **Explore Features**: Try all the features as both candidate and interviewer
2. **Customize**: Modify colors, branding, features as needed
3. **Add Data**: Create sample interviews, users, resumes
4. **Deploy**: Deploy to production when ready
5. **Monitor**: Add logging and monitoring

---

## 📞 Support

- **Email**: prepforge563@gmail.com
- **Phone**: +91 7232915352
- **Hours**: Monday - Saturday, 9:00 AM - 6:00 PM IST

---

## 🎉 Congratulations!

Your PrepForge application is now set up and ready to use!

### Default Test Credentials

You can create test users:

**Candidate**:
- Email: candidate@test.com
- Password: password123

**Interviewer**:
- Email: interviewer@test.com
- Password: password123

Happy Interviewing! 🚀
