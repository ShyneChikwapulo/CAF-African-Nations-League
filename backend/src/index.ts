import dotenv from 'dotenv';


dotenv.config();
import express from 'express';
import cors from 'cors';
import seedRoutes from './routes/seed';


const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.onrender.com' // We'll update this after deployment
  ],
  credentials: true
}));

app.use(express.json());
app.use('/api/seed', seedRoutes);

// Routes
import authRoutes from './routes/auth';
import teamRoutes from './routes/teams';
import tournamentRoutes from './routes/tournament';
import matchRoutes from './routes/matches';

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/matches', matchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'African Nations League API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});