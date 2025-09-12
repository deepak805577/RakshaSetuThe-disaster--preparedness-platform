# Disaster Preparedness Education PWA for Punjab Schools

A comprehensive Progressive Web Application (PWA) designed to educate students, teachers, parents, and administrators in Punjab schools about disaster preparedness through interactive modules, virtual drills, and gamified learning experiences.

## 🌟 Features

### Core Features
- **Multi-role Authentication**: Student, Teacher, Admin, and Parent roles with role-based access control
- **Interactive Learning Modules**: Comprehensive disaster education covering earthquakes, floods, fires, cyclones, drought, and heatwaves
- **Virtual Evacuation Drills**: Real-time timed drills with step-by-step guidance and performance tracking
- **Gamified Learning**: Points, badges, leaderboards, and achievement system to encourage engagement
- **Punjab-Specific Content**: Tailored for Punjab's geographical and cultural context
- **Real-time Alerts**: Regional hazard alerts for Punjab districts
- **Emergency Contact Directory**: Quick access to emergency services with SMS integration
- **Admin Dashboard**: Comprehensive analytics and management tools

### Technical Features
- **Progressive Web App**: Offline capability for rural areas with poor connectivity
- **Real-time Communication**: Socket.io for live drill sessions and alerts
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **TypeScript**: Full type safety across frontend and backend
- **Modern Stack**: React 19, Node.js, Express, MongoDB

## 🚀 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.io Client** for real-time features
- **Axios** for API calls
- **PWA** capabilities with service worker

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Twilio** for SMS integration
- **Nodemailer** for email services

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/disaster-preparedness
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the backend server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎯 Usage

### Demo Accounts
The application includes demo accounts for testing:

- **Admin**: `admin@demo.com` / `admin123`
- **Teacher**: `teacher@demo.com` / `teacher123`
- **Student**: `student@demo.com` / `student123`

### Key Workflows

#### For Students
1. **Register/Login** with student role
2. **Browse Learning Modules** by disaster type and difficulty
3. **Complete Interactive Quizzes** to earn points
4. **Practice Virtual Drills** with real-time feedback
5. **Track Progress** on leaderboards and earn badges

#### For Teachers
1. **Access Teacher Dashboard** to monitor student progress
2. **Create Custom Drills** for classroom practice
3. **View Analytics** on class performance
4. **Manage Student Accounts** and track engagement

#### For Administrators
1. **Comprehensive Dashboard** with platform analytics
2. **User Management** across all roles
3. **Content Management** for modules and drills
4. **System Configuration** and settings
5. **Emergency Alert Broadcasting** to specific districts

#### For Parents
1. **Monitor Child's Progress** and achievements
2. **Access Emergency Contacts** and safety information
3. **View Learning History** and performance metrics
4. **Receive Notifications** about child's activities

## 🏗️ Project Structure

```
sih-disaster-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   ├── types/           # TypeScript type definitions
│   │   └── server.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   │   ├── manifest.json    # PWA manifest
│   │   └── sw.js           # Service worker
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get module by ID
- `POST /api/modules/:id/quiz` - Submit quiz answers

### Drills
- `GET /api/drills` - Get available drills
- `POST /api/drills/start` - Start a drill session
- `POST /api/drills/:id/complete` - Complete drill session

### Gamification
- `GET /api/gamification/leaderboard` - Get leaderboard
- `GET /api/gamification/badges` - Get user badges
- `GET /api/gamification/points` - Get user points

### Admin
- `GET /api/admin/analytics` - Get platform analytics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/alerts` - Broadcast emergency alert

## 🌐 PWA Features

### Offline Capability
- **Service Worker**: Caches essential resources for offline access
- **Offline Pages**: Custom offline page when network is unavailable
- **Background Sync**: Syncs data when connection is restored

### Mobile Experience
- **Responsive Design**: Optimized for all screen sizes
- **Touch Gestures**: Swipe and tap interactions
- **App-like Experience**: Full-screen mode and native feel

### Installation
- **Add to Home Screen**: Users can install the app on their devices
- **App Icons**: Custom icons for different platforms
- **Splash Screen**: Loading screen during app startup

## 🚨 Emergency Features

### Punjab Hazard Alerts
- **Real-time Notifications**: Weather, earthquake, and other hazard alerts
- **District-specific**: Alerts targeted to specific Punjab districts
- **Severity Levels**: Low, medium, high, and critical alert levels

### Emergency Contacts
- **Quick Access**: One-tap calling for emergency services
- **SMS Integration**: Send emergency messages via Twilio
- **Location-based**: Contacts filtered by user's district

## 📊 Analytics & Reporting

### Student Analytics
- **Learning Progress**: Module completion rates and scores
- **Drill Performance**: Response times and accuracy
- **Engagement Metrics**: Time spent and frequency of use

### School Analytics
- **Class Performance**: Aggregate data for each class
- **Teacher Effectiveness**: Teaching impact metrics
- **Safety Readiness**: Overall preparedness scores

### Platform Analytics
- **User Engagement**: Active users and retention rates
- **Content Performance**: Most popular modules and drills
- **System Health**: Performance and error monitoring

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Granular permissions for different user types
- **Password Hashing**: bcrypt for secure password storage

### Data Protection
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization

### Privacy
- **Data Minimization**: Only collect necessary information
- **Secure Storage**: Encrypted sensitive data
- **GDPR Compliance**: User data management and deletion

## 🚀 Deployment

### Backend Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform** (Heroku, AWS, DigitalOcean, etc.)
3. **Set environment variables** in your deployment platform
4. **Configure MongoDB** (MongoDB Atlas recommended for production)

### Frontend Deployment
1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to static hosting** (Netlify, Vercel, AWS S3, etc.)
3. **Configure PWA settings** for your domain
4. **Set up HTTPS** for PWA functionality

### Environment Variables
Ensure all required environment variables are set in your production environment:

**Backend:**
- `MONGODB_URI`
- `JWT_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

**Frontend:**
- `REACT_APP_API_URL`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Punjab State Government for supporting disaster preparedness education
- Educational institutions for providing feedback and requirements
- Open source community for the amazing tools and libraries used
- Disaster management experts for content validation

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation and FAQ

---

**Built with ❤️ for Punjab Schools' Safety and Preparedness**
