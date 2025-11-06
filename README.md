# African Nations League - Complete Guide

## 🌍 Overview

The African Nations League is a football tournament simulation platform where you can register teams, simulate matches with AI commentary, track tournament progress, and view detailed statistics.

---

## 💻 Local Development Setup (VS Code)

### Prerequisites
- Node.js (v18 or higher)
- VS Code
- Git
- Firebase project

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd african-nations-league

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Environment Setup

**Backend Setup:**
1. Create `backend/.env` file:
```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT={"type": "service_account", "project_id": "your-project-id", ...}
OPENAI_API_KEY=your-openai-api-key
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-jwt-secret
```

2. Add Firebase service account key:
   - Download from Firebase Console → Project Settings → Service Accounts
   - Save as `backend/serviceAccountKey.json`

**Frontend Setup:**
1. Create `frontend/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Run the Application

**Option A: Separate Terminals (Recommended)**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

**Option B: VS Code Integrated Terminal**
1. Open VS Code
2. Open two terminals:
   - Terminal 1: `cd backend && npm run dev`
   - Terminal 2: `cd frontend && npm start`
3. Both servers will start automatically

### Step 4: Verify Setup
- **Backend:** http://localhost:5000/api/health
- **Frontend:** http://localhost:3000

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Bracket Pair Colorizer
- Thunder Client (for API testing)

---

## 🚀 Quick Start Guide

### Step 1: Access the Application
- **Local:** Open http://localhost:3000
- **Production:** Open your deployed application URL
- You'll land on the home page showing tournament information

### Step 2: Register Your Team
1. **Click "Register Team"** in the navigation menu
2. **Fill in the registration form:**
   - **Email:** Your email address
   - **Country:** Select **South Africa** (recommended for demo)
   - **Manager Name:** Enter your name or any manager name
3. **Click "Continue to Team Setup"**
4. **Review your details** and click **"Complete Registration & Generate Team"**

✅ **Your team will be automatically created with:**
- 23 players (3 GK, 8 DF, 8 MD, 4 AT)
- Randomly generated player ratings
- Team average rating calculated automatically

### Step 3: Login as Admin
**Default Admin Credentials:**
```
Email: admin@africanleague.com
Password: admin123
```

1. **Log out** of your representative account
2. **Log in as Admin** using the credentials above
3. **Navigate to the Admin Panel**

### Step 4: Generate Demo Teams
1. **In the Admin Panel**, click the **"Seed Demo Data"** button
2. **Wait for confirmation** - 7 additional teams will be created automatically:
   - Nigeria, Egypt, Senegal, Morocco, Ghana, Ivory Coast, Cameroon

### Step 5: Create Tournament
1. **In the Admin Panel**, select **8 teams** for the tournament
2. **Click "Create Tournament"** to generate the tournament bracket

### Step 6: Play Matches
1. **In the Admin Panel**, you'll see all tournament matches
2. **For each match, you can:**
   - **"Play Match with AI"** - Generates realistic commentary and detailed match analysis
   - **"Simulate Match"** - Quick simulation without commentary

---

## 🏆 Key Features

### Tournament Bracket
- **View:** Navigate to "Tournament" page
- **Features:**
  - Visual bracket with team flags
  - Match scores and results
  - Click any match for detailed view
  - Trophy display for the champion

### Match Details
- **AI Played Matches:** Full commentary, goal scorers, match events
- **Simulated Matches:** Basic scoreline and goal information
- **Email Notifications:** Both teams receive match result emails

### Goal Scorers Leaderboard
- **View:** On the Tournament page
- **Shows:** Top goal scorers across the entire tournament
- **Includes:** Player name, team, and goal count

### Team Dashboard
- **Access:** Login as team representative and go to "Team Dashboard"
- **Features:**
  - Team profile and statistics
  - Complete squad list with player ratings
  - Upcoming matches
  - Match history with results
  - Performance analytics

---

## 👥 User Roles

### Federation Representative
- **Register and manage** their national team
- **View** team dashboard with detailed analytics
- **Receive** email notifications for match results
- **Monitor** player statistics and team performance

### Administrator
- **Create and manage** tournaments
- **Play or simulate** matches
- **Generate** demo data
- **Reset** tournaments
- **Access** all system features

### Visitor (Public)
- **View** tournament bracket
- **See** match summaries
- **Check** goal scorers leaderboard
- **Browse** team information

---

## 🎮 How to Run a Complete Tournament

### Phase 1: Setup
1. Register at least 8 teams (use Seed Data for quick setup)
2. Create tournament in Admin Panel
3. Verify bracket appears on Tournament page

### Phase 2: Quarter-Finals
1. Go to Admin Panel → Match Management
2. Play/SIM each quarter-final match
3. Check bracket updates automatically

### Phase 3: Semi-Finals
1. Winners automatically advance to semi-finals
2. Play/SIM semi-final matches
3. Bracket updates with advancing teams

### Phase 4: Final
1. Play the championship match
2. Winner is crowned champion
3. Trophy appears on bracket

---

## 📊 Understanding the System

### Player Ratings
- **Natural Position:** 50-100 rating
- **Other Positions:** 0-50 rating
- **Team Rating:** Average of natural position ratings

### Match Simulation
- **AI Played:** Full commentary, realistic match flow, detailed events
- **Simulated:** Basic result calculation, no commentary
- **Scoring:** Based on team ratings with randomness factor

### Email System
- **Automatic notifications** sent after each match
- **Includes:** Final score, result, goal scorers
- **Sent to:** Both team representatives

---

## 🔧 Troubleshooting

### Development Issues

**Backend won't start:**
- Check if port 5000 is available
- Verify all environment variables are set
- Ensure Firebase service account key exists

**Frontend build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

**Database connection issues:**
- Verify Firebase project is set up
- Check service account permissions

### Common Application Issues

**"No Active Tournament" Message**
- Solution: Ensure 8 teams are registered and tournament is created in Admin Panel

**Goal Scorers Leaderboard Empty**
- Solution: Play some matches first - goals are only tracked after matches are completed

**AI Commentary Not Generating**
- Solution: Check OpenAI API key and credits

**Team Not Appearing in Dashboard**
- Solution: Log out and log back in, or check if team was properly registered

**Match Won't Play**
- Solution: Ensure tournament is active and match hasn't already been completed

---

## 💡 Pro Tips

### Development Tips
1. **Use VS Code debugger** for backend debugging
2. **Check browser console** for frontend errors
3. **Use Thunder Client** to test API endpoints
4. **Monitor Firebase console** for database operations

### Application Tips
1. **For Best Demo:** Always start by registering South Africa, then use Seed Data
2. **AI Matches:** Provide the most engaging experience with full commentary
3. **Quick Testing:** Use "Simulate Match" for faster tournament progression
4. **Data Persistence:** All data is saved in the database between sessions
5. **Mobile Friendly:** The app works great on mobile devices too

---

## 📱 Supported Browsers

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

---

## 🆘 Getting Help

### Development Support
- Check console logs for detailed error messages
- Verify all environment variables are set
- Ensure Firebase project is properly configured

### Application Support
If you encounter any issues:
1. Check this guide first
2. Ensure you're following the step-by-step process
3. Use the default admin credentials:
   ```
   Email: admin@africanleague.com
   Password: admin123
   ```
4. Verify all environment settings are correct

---

## 🚀 Deployment

### Quick Deploy to Render
1. **Backend:** Create Web Service, connect GitHub, set environment variables
2. **Frontend:** Create Static Site, connect GitHub, set build commands
3. **Update CORS** with your production URLs

### Environment Variables for Production
```
FIREBASE_SERVICE_ACCOUNT={your-full-json}
OPENAI_API_KEY=your-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-secret
REACT_APP_API_URL=your-backend-url
```

---

**Enjoy developing and managing your African Nations League tournament!** 🌍⚽

*Default Admin Credentials: admin@africanleague.com / admin123*