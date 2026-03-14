# Fitplan.ai - AI-Powered Fitness & Diet Planning Platform

A comprehensive fitness application that uses AI (Google Gemini) to generate personalized workout plans and location-aware diet recommendations based on user profiles and preferences.

## 🎯 Features

### Core Features
- **Personalized Workout Plans**: AI-generated workout routines based on fitness level, goals, and health conditions
- **Location-Aware Diet Planning**: Region-specific meal suggestions with respect to local cuisine and ingredient availability
- **Food Preference Management**: Optional vegetarian-only or mixed (veg + non-veg) diet preferences
- **Real-time BMI Calculator**: Calculate BMI and get target weight recommendations
- **Progress Tracking**: Monitor fitness progress with visual charts and statistics
- **User Profile Management**: Complete profile customization in settings

### Dashboard Features
- **Compact Home View**: Quick overview of daily meals and workouts
- **Detailed Diet Plan View**: Full nutritional breakdown with quantities, calories, and macros
- **Mood Mode Selector**: Track mood and fitness mode preferences
- **Progress Charts**: Visual representation of fitness metrics
- **Notifications**: Stay updated with fitness milestones and reminders

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Zustand** for state management
- **Lucide React** for icons
- **Shadcn/UI** component library
- **Vitest** for unit testing

### Backend
- **Python 3.10+**
- **FastAPI** for API framework
- **MongoDB** for database
- **Google Gemini 2.5 Flash** for AI-powered plan generation
- **PyJWT** for authentication

### Deployment
- Docker containerization ready
- Environment-based configuration

## 📁 Project Structure

```
Fitplan.ai Frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Shadcn UI components (buttons, cards, forms, etc.)
│   │   └── dashboard/      # Dashboard-specific components
│   ├── pages/              # Page components (Login, Onboarding, Dashboard)
│   ├── store/              # Zustand state management (fitplanStore.ts)
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Layout wrapper components
│   ├── lib/                # Utility functions
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
├── vitest.config.ts        # Vitest testing configuration
└── package.json            # Dependencies & scripts

backend/
├── main.py                 # FastAPI application entry
├── models.py               # Pydantic models
├── geminiapi.py            # Gemini AI integration
├── database.py             # MongoDB connection
├── requirements.txt        # Python dependencies
└── .env.example            # Environment variables template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ with Bun or npm
- Python 3.10+
- MongoDB (local or Atlas)
- Google Gemini API key

### Frontend Setup

1. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

2. **Environment variables** (create `.env.local`)
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. **Start development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

4. **Build for production**
   ```bash
   bun run build
   # or
   npm run build
   ```

### Backend Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment variables** (create `.env`)
   ```
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=fitplan_db
   GEMINI_API_KEY=your_api_key_here
   JWT_SECRET=your_jwt_secret
   ```

3. **Run development server**
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

## 📊 Workflow Overview

The application follows this workflow:

1. **User Registration & Authentication**
   - User creates account with email/password
   - JWT token issued for authenticated requests

2. **Onboarding (5 Steps)**
   - Step 1: Basic Information (Name, Email, Age, Gender)
   - Step 2: Fitness Profile (Height, Weight, Goal, Activity Level)
   - Step 3: Health & Preferences (Health Issues, Location, Food Preference)
   - Step 4: Confirmation (Review all details)
   - Step 5: Plan Generation (AI generates workout and diet plans)

3. **Plan Generation**
   - User profile sent to Gemini API
   - Location considered for regional cuisine
   - Food preferences respected (veg vs mixed)
   - Plans cached in Zustand store and MongoDB

4. **Dashboard Usage**
   - Home Page: Compact view of today's meals and workouts
   - Diet Plan Page: Detailed meal breakdown with quantities and macros
   - Workout Plan Page: Complete workout routine with exercises
   - Progress Page: Track fitness metrics over time
   - Settings Page: Modify profile and regenerate plans

## 🔄 Data Flow

```
User Input (Onboarding)
    ↓
Zustand Store (fitplanStore.ts)
    ↓
Backend API (FastAPI)
    ↓
MongoDB Storage
    ↓
Gemini AI (Plan Generation)
    ↓
Response Cached in Store & DB
    ↓
Dashboard Display
```

## 🔐 Authentication

- JWT-based authentication
- Token stored in localStorage
- Auto-refresh on app load
- Protected routes requiring authentication

## 🎨 UI Components

### Custom Components
- `FitnessButton`: Primary action button with fitness theme
- `FitnessCard`: Card component with fitness styling
- `FitnessInput`: Input field with integrated label
- `ModeChip`: Mood/mode selection chips
- `ProgressRing`: Circular progress indicator
- `StepIndicator`: Multi-step form indicator

### Shadcn Components
- Dialog, Drawer, AlertDialog for modals
- Form components with validation
- Card, Badge, Button, Input, Select
- Tabs, Accordion, Collapsible for organization

## 📱 Responsive Design

- Mobile-first approach using Tailwind CSS
- Sidebar responsive on tablet/mobile
- Touch-friendly button sizes
- Horizontal scrolling for diet panels on small screens

## 🧪 Testing

```bash
# Run tests
bun run test
# or
npm run test

# Run tests with coverage
bun run test:ui
```

## 🐳 Docker Support

```bash
# Build frontend image
docker build -t fitplan-frontend .

# Build backend image
cd backend && docker build -t fitplan-backend .

# Run with docker-compose
docker-compose up
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token

### User Profile
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

### AI Plans
- `POST /ai/workout` - Generate workout plan
- `POST /ai/diet` - Generate diet plan
- `GET /user/plans` - Get user's saved plans

### Health Data
- `GET /health/summary` - Get health summary
- `POST /health/log` - Log health metrics

## 🔗 Environment Variables

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Fitplan.ai
```

### Backend (.env)
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=fitplan_db
GEMINI_API_KEY=<your_key>
JWT_SECRET=<your_secret>
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 🚨 Error Handling

- API errors logged with error codes
- User-friendly error messages via toast notifications
- Fallback UI for data loading failures
- Retry mechanisms for failed requests

## 📈 Performance Optimization

- Code splitting with React.lazy
- Image optimization with webp format
- CSS minification with Tailwind
- API response caching in Zustand
- Lazy loading of route components

## 🔄 State Management

### Zustand Store (fitplanStore.ts)
```typescript
- userProfile: User profile data
- workoutPlans: Generated/saved workout plans
- dietPlans: Generated/saved diet plans
- setUserProfile: Update user profile
- setWorkoutPlans: Cache workout plans
- setDietPlans: Cache diet plans
- clearAllPlans: Clear all cached plans
```

## 🎓 Key Concepts

### Location-Aware Diet Planning
- Gemini generates meals based on user's location
- Regional cuisines and local ingredients considered
- Examples: India (dal, paneer), USA (chicken, broccoli), etc.

### Food Preferences
- Optional "Vegetarian Only" mode
- Default: Mixed (vegetarian + non-veg)
- Applied to all generated meal plans

### BMI & Target Weight
- Real-time BMI calculation: weight(kg) / height(m)²
- Target weight based on BMI 22-24 (healthy range)
- Displayed with color coding (green for healthy, yellow/red for attention)

### Mood Tracking
- Users select mood mode before workout
- Affects workout intensity recommendations
- Tracked in progress charts

## 🐛 Debugging

### Frontend Debugging
- React DevTools browser extension recommended
- Zustand DevTools for state inspection
- Console logs for API calls and data flow

### Backend Debugging
- FastAPI automatic Swagger UI at `http://localhost:8000/docs`
- MongoDB Compass for database inspection
- Python logging with detailed error traces

## 📚 Documentation Files

- **README.md** - Project overview (this file)
- **ARCHITECTURE.md** - Detailed system architecture
- **WORKFLOW.md** - Visual workflow diagrams
- **API_DOCUMENTATION.md** - Complete API reference
- **SETUP_GUIDE.md** - Detailed setup instructions
- **CONTRIBUTING.md** - Contribution guidelines

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is proprietary and confidential.

## 📞 Support

For issues and questions:
- Check existing GitHub issues
- Create new issue with detailed description
- Contact development team

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Status**: Production Ready
