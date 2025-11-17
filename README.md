# PrepForge - AI-Powered Interview Preparation Platform

A modern, full-stack SaaS platform for interview preparation featuring AI mock interviews, live video interviews, and resume analysis.

## 🚀 Features

### Core Features
- **AI Mock Interviews** - Practice with AI interviewer and get instant feedback
- **Live Video Interviews** - Real-time interviews with experienced professionals
- **Resume Analysis** - AI-powered resume optimization and ATS scoring
- **Interactive Dashboard** - Track progress and performance analytics
- **Real-time Chat** - Communication during live interviews
- **Voice Recognition** - Answer questions via voice or text

### Technical Features
- **Modern UI/UX** - Sleek design with smooth animations
- **Real-time Communication** - WebRTC for video calls, Socket.IO for messaging
- **Secure Authentication** - JWT-based auth with role management
- **File Upload** - Resume upload with analysis
- **Responsive Design** - Works on all devices
- **Dark Theme** - Modern dark interface

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** - Modern React setup
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Socket.IO Client** - Real-time features
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Multer** - File uploads
- **OpenAI API** - AI features

## 📦 Project Structure

```
PrepForge/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── middleware/     # Auth & error handling
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.js       # Main server file
│   └── package.json
├── frontend/               # React/Vite app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── App.jsx
│   └── package.json
├── start-dev.bat          # Development startup script
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd PrepForge
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Or use the startup script (Windows)**
```bash
start-dev.bat
```

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/prepforge
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

## 📱 Usage

1. **Register/Login** - Create account or sign in
2. **Dashboard** - View your interview statistics and progress
3. **AI Interview** - Start practicing with AI interviewer
4. **Live Interview** - Schedule or join live video interviews
5. **Resume Analysis** - Upload resume for AI feedback
6. **Profile** - Manage your account settings

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### AI Interviews
- `POST /api/ai-interviews` - Create AI interview
- `GET /api/ai-interviews` - Get user's interviews
- `POST /api/ai-interviews/:id/responses` - Submit answer

### Live Interviews
- `POST /api/live-interviews` - Schedule interview
- `GET /api/live-interviews` - Get interviews
- `GET /api/live-interviews/room/:roomId` - Get room details

### Resumes
- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes` - Get user's resumes
- `GET /api/resumes/:id` - Get resume analysis

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

### Building for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## 🚀 Deployment

### Backend (Node.js)
- Deploy to Heroku, Railway, or any Node.js hosting
- Set environment variables
- Connect to MongoDB Atlas

### Frontend (React)
- Deploy to Vercel, Netlify, or any static hosting
- Set build command: `npm run build`
- Set environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Socket.IO for real-time features
- Tailwind CSS for styling
- Framer Motion for animations

## 📞 Support

For support, email support@prepforge.com or create an issue in the repository.

---

**PrepForge** - Ace your next interview! 🎯