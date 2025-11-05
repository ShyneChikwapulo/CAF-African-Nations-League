import express from 'express';
import { db } from '../config/firebase';

const router = express.Router();

// Get all matches
router.get('/', async (req, res) => {
  try {
    const matchesSnapshot = await db.collection('matches').get();
    const matches = matchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get match by ID
router.get('/:id', async (req, res) => {
  try {
    const matchDoc = await db.collection('matches').doc(req.params.id).get();
    
    if (!matchDoc.exists) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json({
      id: matchDoc.id,
      ...matchDoc.data()
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Debug endpoint to check data
router.get('/debug/goal-data', async (req, res) => {
  try {
    const [goalLeadersSnapshot, matchesSnapshot] = await Promise.all([
      db.collection('goalLeaders').get(),
      db.collection('matches').get()
    ]);

    const goalLeaders = goalLeadersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const allMatchGoalScorers: any[] = [];
    let totalGoalsFromMatches = 0;
    
    matchesSnapshot.docs.forEach(doc => {
      const match = doc.data();
      if (match.goalScorers && Array.isArray(match.goalScorers)) {
        allMatchGoalScorers.push(...match.goalScorers);
        totalGoalsFromMatches += match.goalScorers.length;
      }
    });

    res.json({
      goalLeaders: {
        count: goalLeaders.length,
        data: goalLeaders
      },
      matchGoalScorers: {
        count: allMatchGoalScorers.length,
        totalGoals: totalGoalsFromMatches,
        data: allMatchGoalScorers.slice(0, 10) // First 10 for preview
      },
      totalMatches: matchesSnapshot.size,
      matchesWithGoals: matchesSnapshot.docs.filter(doc => 
        doc.data().goalScorers && Array.isArray(doc.data().goalScorers) && doc.data().goalScorers.length > 0
      ).length
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

router.get('/stats/goal-scorers', async (req, res) => {
  try {
    const { tournamentId } = req.query;
    
    if (!tournamentId || typeof tournamentId !== 'string') {
      return res.status(400).json({ 
        error: 'tournamentId query parameter is required and must be a string' 
      });
    }

    console.log(`Fetching goal leaders for tournament: ${tournamentId}`);

    // Get goal leaders for specific tournament
    const goalLeadersSnapshot = await db.collection('goalLeaders')
      .where('tournamentId', '==', tournamentId)
      .get();

    const leaderboard = goalLeadersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a: any, b: any) => b.goals - a.goals);

    console.log(`Found ${leaderboard.length} goal scorers for tournament ${tournamentId}`);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching goal scorers:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;