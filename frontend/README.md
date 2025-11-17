# PrepForge Frontend

A modern, animated React + Vite frontend for the PrepForge interview preparation platform.

## Features

- 🎨 Modern UI with Tailwind CSS
- ✨ Smooth animations with Framer Motion
- 🎯 AI-powered mock interviews
- 📹 Live video interviews with WebRTC
- 📄 Resume analysis and feedback
- 📊 Interactive dashboard
- 🔐 Secure authentication
- 📱 Responsive design

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Zustand** - State management
- **React Router** - Navigation
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AnimatedBackground.jsx
│   ├── Layout.jsx
│   ├── LoadingSpinner.jsx
│   └── Notification.jsx
├── pages/              # Page components
│   ├── AIInterview.jsx
│   ├── AIInterviewSession.jsx
│   ├── Dashboard.jsx
│   ├── InterviewRoom.jsx
│   ├── Landing.jsx
│   ├── LiveInterview.jsx
│   ├── Login.jsx
│   ├── Profile.jsx
│   ├── Register.jsx
│   └── ResumeMaker.jsx
├── services/           # API services
│   └── api.js
├── store/             # State management
│   └── authStore.js
├── App.jsx            # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features Overview

### Landing Page
- Animated hero section with floating elements
- Feature showcase with smooth animations
- Modern gradient design

### Authentication
- Login/Register with form validation
- JWT token management
- Protected routes

### Dashboard
- Overview of interview statistics
- Quick action cards
- Upcoming interviews display

### AI Interviews
- Configurable interview settings
- Real-time question generation
- Voice and text responses
- Instant feedback

### Live Interviews
- Video calling with WebRTC
- Real-time chat
- Screen sharing capabilities
- Interview scheduling

### Resume Analysis
- File upload with drag & drop
- AI-powered analysis
- Detailed feedback and scoring
- Improvement suggestions

## Styling

The app uses a dark theme with:
- Primary color: Blue (`#0ea5e9`)
- Dark backgrounds: Various shades of slate
- Smooth animations and transitions
- Responsive design for all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.