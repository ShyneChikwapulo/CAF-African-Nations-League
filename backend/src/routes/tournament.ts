import express from 'express';
import { db } from '../config/firebase';
import { playMatch } from '../services/matchService';
import { resetTournamentGoalLeaderboard } from '../services/tournamentService';

interface MatchData {
  id: string;
  tournamentId: string;
  round: 'quarterfinal' | 'semifinal' | 'final';
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  goalScorers: any[];
  commentary: string[];
  status: 'scheduled' | 'live' | 'completed';
  matchType: 'played' | 'simulated';
  createdAt: Date;
  completedAt?: Date;
}

const router = express.Router();


// GET CURRENT TOURNAMENT

router.get('/current', async (req, res) => {
  try {
    const tournamentSnapshot = await db.collection('tournaments')
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (tournamentSnapshot.empty) {
      return res.json(null);
    }

    const tournament = {
      id: tournamentSnapshot.docs[0].id,
      ...tournamentSnapshot.docs[0].data()
    };

    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE NEW TOURNAMENT
router.post('/create', async (req, res) => {
  try {
    const { teamIds } = req.body;

    if (teamIds.length !== 8) {
      return res.status(400).json({ error: 'Tournament requires exactly 8 teams' });
    }

    // Clear any existing active tournaments first
    const activeTournaments = await db.collection('tournaments')
      .where('isActive', '==', true)
      .get();

    if (!activeTournaments.empty) {
      const batch = db.batch();
      activeTournaments.docs.forEach(doc => {
        batch.update(doc.ref, { isActive: false });
      });
      await batch.commit();
      console.log('Deactivated existing active tournaments');
    }

    // Fetch team details
    const teams: any[] = [];
    for (const teamId of teamIds) {
      const teamDoc = await db.collection('teams').doc(teamId).get();
      if (teamDoc.exists) teams.push({ id: teamDoc.id, ...teamDoc.data() });
    }

    // Shuffle teams
    const shuffled = [...teams].sort(() => Math.random() - 0.5);

    // Create quarterfinals
    const matchIds: string[] = [];
    for (let i = 0; i < 4; i++) {
      const teamA = shuffled[i * 2];
      const teamB = shuffled[i * 2 + 1];

      const matchRef = await db.collection('matches').add({
        tournamentId: '', // updated later
        round: 'quarterfinal',
        teamAId: teamA.id,
        teamBId: teamB.id,
        teamAName: teamA.country,
        teamBName: teamB.country,
        scoreA: 0,
        scoreB: 0,
        goalScorers: [],
        commentary: [],
        status: 'scheduled',
        matchType: 'simulated',
        createdAt: new Date()
      });
      matchIds.push(matchRef.id);
    }

    // Create tournament
    const tournamentRef = await db.collection('tournaments').add({
      name: 'African Nations League',
      teams: teamIds,
      matches: matchIds,
      currentRound: 'quarterfinal',
      isActive: true,
      createdAt: new Date()
    });

    // Update matches with tournamentId
    for (const id of matchIds) {
      await db.collection('matches').doc(id).update({ tournamentId: tournamentRef.id });
    }

    res.json({ id: tournamentRef.id, teams: teamIds });
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// PLAY MATCH
router.post('/matches/:matchId/play', async (req, res) => {
  try {
    const { matchType } = req.body; // 'played' or 'simulated'
    
    if (!matchType || (matchType !== 'played' && matchType !== 'simulated')) {
      return res.status(400).json({ error: 'matchType must be "played" or "simulated"' });
    }
    
    await playMatch(req.params.matchId, matchType);
    res.json({ 
      message: `Match ${matchType === 'played' ? 'played with AI commentary' : 'simulated'} successfully` 
    });
  } catch (error) {
    console.error('Error playing match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// RESET TOURNAMENT (KEEP THIS ONE - IT RESETS GOAL LEADERBOARD)

router.post('/reset', async (req, res) => {
  try {
    // Get current tournament first
    const tournamentSnapshot = await db.collection('tournaments')
      .where('isActive', '==', true)
      .get();

    if (!tournamentSnapshot.empty) {
      const currentTournament = tournamentSnapshot.docs[0];
      const tournamentId = currentTournament.id;
      
      console.log(`Resetting tournament ${tournamentId}`);
      
      // Reset goal leaderboard for this tournament
      const resetResult = await resetTournamentGoalLeaderboard(tournamentId);
      console.log('Goal leaderboard reset result:', resetResult);
      
      // Deactivate current tournament
      const batch = db.batch();
      tournamentSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { 
          isActive: false,
          resetAt: new Date()
        });
      });
      
      await batch.commit();
      console.log(`Tournament ${tournamentId} deactivated`);
    } else {
      console.log('No active tournament found to reset');
    }
    
    res.json({ 
      message: 'Tournament reset successfully, goal leaderboard cleared',
      resetAt: new Date()
    });
  } catch (error) {
    console.error('Error resetting tournament:', error);
    res.status(500).json({ 
      error: 'Internal server error during reset',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// ADVANCEMENT LOGIC

async function updateTournamentProgress(matchId: string) {
  const matchDoc = await db.collection('matches').doc(matchId).get();
  if (!matchDoc.exists) return;

  const match = matchDoc.data() as MatchData;
  const tournamentRef = db.collection('tournaments').doc(match.tournamentId);
  const tournamentDoc = await tournamentRef.get();
  const tournament = tournamentDoc.data();

  if (!tournament || !tournament.isActive) return;

  const round = match.round;
  const matchesSnapshot = await db.collection('matches')
    .where('tournamentId', '==', match.tournamentId)
    .where('round', '==', round)
    .get();

  // Use the MatchData interface
  const matches = matchesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as MatchData[];

  const allCompleted = matches.every(m => m.status === 'completed');

  console.log(`Checking ${round} progression: ${matches.length} matches, all completed: ${allCompleted}`);

  if (!allCompleted) return;

  if (round === 'quarterfinal') {
    // Winners advance to semifinal
    const winners: string[] = matches.map(m =>
      m.scoreA > m.scoreB ? m.teamAId : m.teamBId
    );
    await createNextRound(tournamentRef, 'semifinal', winners);
  } else if (round === 'semifinal') {
    // Winners advance to final
    const winners: string[] = matches.map(m =>
      m.scoreA > m.scoreB ? m.teamAId : m.teamBId
    );
    await createNextRound(tournamentRef, 'final', winners);
  } else if (round === 'final') {
    console.log('Final completed, tournament finished!');
    
    // Determine winner - Now with proper typing
    const finalMatch = matches[0];
    let winner, winnerId;
    
    if (finalMatch.scoreA > finalMatch.scoreB) {
      winner = finalMatch.teamAName;
      winnerId = finalMatch.teamAId;
    } else if (finalMatch.scoreB > finalMatch.scoreA) {
      winner = finalMatch.teamBName;
      winnerId = finalMatch.teamBId;
    } else {
      // Handle draw - for now, pick teamA as winner
      winner = finalMatch.teamAName;
      winnerId = finalMatch.teamAId;
    }
    
    await tournamentRef.update({ 
      isActive: false, 
      currentRound: 'completed',
      winner: winner,
      winnerId: winnerId,
      completedAt: new Date()
    });

    console.log(`🏆 TOURNAMENT COMPLETE! Champion: ${winner} 🏆`);
  }
}


// CREATE NEXT ROUND

async function createNextRound(tournamentRef: FirebaseFirestore.DocumentReference, nextRound: string, teamIds: string[]) {
  const matchIds: string[] = [];

  for (let i = 0; i < teamIds.length / 2; i++) {
    const teamAId = teamIds[i * 2];
    const teamBId = teamIds[i * 2 + 1];

    const teamA = (await db.collection('teams').doc(teamAId).get()).data();
    const teamB = (await db.collection('teams').doc(teamBId).get()).data();

    const matchRef = await db.collection('matches').add({
      tournamentId: tournamentRef.id,
      round: nextRound,
      teamAId,
      teamBId,
      teamAName: teamA?.country || 'Team A',
      teamBName: teamB?.country || 'Team B',
      scoreA: 0,
      scoreB: 0,
      goalScorers: [],
      commentary: [],
      status: 'scheduled',
      matchType: 'simulated',
      createdAt: new Date()
    });

    matchIds.push(matchRef.id);
  }

  await tournamentRef.update({
    matches: matchIds,
    currentRound: nextRound
  });
}

// --- Get Global Goal Leaders ---
router.get('/goal-leaders', async (req, res) => {
  try {
    const snapshot = await db.collection('goalLeaders')
      .orderBy('goals', 'desc')
      .limit(20)
      .get();

    const leaders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(leaders);
  } catch (error) {
    console.error('Error fetching goal leaders:', error);
    res.status(500).json({ error: 'Failed to fetch goal leaders' });
  }
});

export { updateTournamentProgress };
export default router;