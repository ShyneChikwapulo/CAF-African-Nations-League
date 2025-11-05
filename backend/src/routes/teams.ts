import express from 'express';
import { db } from '../config/firebase';
import { generateSquad, calculateTeamRating } from '../services/playerService';
import { authenticate, requireRepresentative, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teamsSnapshot = await db.collection('teams').get();
    const teams = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register new team 
router.post('/register', authenticate, requireRepresentative, async (req: AuthRequest, res) => {
  try {
    const { country, manager } = req.body;
    const representativeId = req.user!.userId;

    // Check if user already has a team
    const existingTeam = await db.collection('teams').where('representativeId', '==', representativeId).get();
    if (!existingTeam.empty) {
      return res.status(400).json({ error: 'You already have a registered team' });
    }

    // Check if team already exists for this country
    const existingCountryTeam = await db.collection('teams').where('country', '==', country).get();
    if (!existingCountryTeam.empty) {
      return res.status(400).json({ error: 'Team already registered for this country' });
    }

    // Generate squad and calculate rating
    const squad = generateSquad(country); 
    const averageRating = calculateTeamRating(squad);

    const team = {
      country,
      manager,
      representativeId,
      squad,
      averageRating,
      createdAt: new Date()
    };

    const teamRef = await db.collection('teams').add(team);
    
    res.json({ 
      id: teamRef.id, 
      ...team 
    });
  } catch (error) {
    console.error('Team registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const teamDoc = await db.collection('teams').doc(req.params.id).get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json({
      id: teamDoc.id,
      ...teamDoc.data()
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;