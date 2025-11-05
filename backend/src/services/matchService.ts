import { Team, Match, GoalScorer } from '../models/types';
import { generateMatchCommentary } from './aiService';
import { sendMatchResultEmail } from './emailService';
import { db } from '../config/firebase';
import { updateTournamentProgress } from '../routes/tournament';

// SIMULATED MATCH - Fast, no AI commentary, just basic result
export const simulateMatch = async (
  teamA: Team,
  teamB: Team
): Promise<{ scoreA: number; scoreB: number; goalScorers: GoalScorer[]; commentary: string[] }> => {

  console.log(`SIMULATING match between ${teamA.country} and ${teamB.country}`);
  
  // Base scores based on team ratings
  const baseScoreA = teamA.averageRating / 25;
  const baseScoreB = teamB.averageRating / 25;

  // Add randomness
  const scoreA = Math.max(0, Math.floor(baseScoreA + (Math.random() * 3 - 1)));
  const scoreB = Math.max(0, Math.floor(baseScoreB + (Math.random() * 3 - 1)));

  // Ensure at least one goal if 0-0
  let finalScoreA = scoreA;
  let finalScoreB = scoreB;
  
  if (scoreA === 0 && scoreB === 0) {
    if (Math.random() > 0.5) {
      finalScoreA = 1;
    } else {
      finalScoreB = 1;
    }
  }

  console.log(`Simulated final score: ${finalScoreA}-${finalScoreB}`);

  const goalScorers: GoalScorer[] = [];

  // Generate goal scorers
  const generateGoals = (team: Team, goals: number) => {
    if (goals === 0) return;

    const attackingPlayers = team.squad.filter(p => 
      p.naturalPosition === 'AT' || p.naturalPosition === 'MD'
    );
    
    if (attackingPlayers.length === 0) {
      console.warn(`No attacking players found for ${team.country}!`);
      return;
    }

    for (let i = 0; i < goals; i++) {
      const scorer = attackingPlayers[Math.floor(Math.random() * attackingPlayers.length)];
      const minute = Math.floor(Math.random() * 90) + 1;
      
      const goalScorer: GoalScorer = {
        playerId: scorer.id,
        playerName: scorer.name,
        teamId: team.id,
        teamName: team.country,
        minute
      };

      goalScorers.push(goalScorer);
    }
  };

  // Generate goals for both teams
  generateGoals(teamA, finalScoreA);
  generateGoals(teamB, finalScoreB);

  // Sort by minute
  goalScorers.sort((a, b) => a.minute - b.minute);

  // For simulated matches: SIMPLE commentary only
  const commentary = [
    `Match Simulation: ${teamA.country} ${finalScoreA}-${finalScoreB} ${teamB.country}`,
    ...goalScorers.map(gs => `${gs.minute}': ${gs.playerName} scores for ${gs.teamName}`),
    `Simulation complete. ${finalScoreA > finalScoreB ? teamA.country : finalScoreB > finalScoreA ? teamB.country : 'Both teams'} ${finalScoreA === finalScoreB ? 'draw' : 'wins'}!`
  ];

  return {
    scoreA: finalScoreA,
    scoreB: finalScoreB,
    goalScorers,
    commentary
  };
};

// PLAYED MATCH - Full AI commentary with detailed events
export const playMatchWithAI = async (
  teamA: Team,
  teamB: Team
): Promise<{ scoreA: number; scoreB: number; goalScorers: GoalScorer[]; commentary: string[] }> => {

  console.log(`PLAYING match with AI commentary: ${teamA.country} vs ${teamB.country}`);
  
  // Generate more realistic match progression
  const matchEvents = generateDetailedMatchEvents(teamA, teamB);
  
  // Extract results from events
  const { scoreA, scoreB, goalScorers } = extractMatchResults(matchEvents, teamA, teamB);

  console.log(`AI Played final score: ${scoreA}-${scoreB}`);

  // Generate AI commentary based on detailed events
  let commentary: string[] = [];
  try {
    console.log("Generating AI commentary for played match...");
    commentary = await generateMatchCommentary(teamA.country, teamB.country, matchEvents);
    console.log("Generated commentary length:", commentary.length);
  } catch (error) {
    console.error("AI commentary failed, using enhanced fallback commentary");
    // Enhanced fallback commentary for played matches
    commentary = [
      `🎯 MATCH DAY! ${teamA.country} vs ${teamB.country} kicks off in the African Nations League!`,
      `The atmosphere is electric as both teams take to the field.`,
      ...matchEvents.slice(0, 8), // Show first 8 key events
      `🏁 FULL TIME! ${teamA.country} ${scoreA}-${scoreB} ${teamB.country}`,
      ...goalScorers.map(gs => `⚽ ${gs.minute}': ${gs.playerName} finds the net for ${gs.teamName}!`),
      `What an incredible match of African football!`
    ];
  }

  return {
    scoreA,
    scoreB,
    goalScorers,
    commentary
  };
};

// Generate detailed match events for played matches
const generateDetailedMatchEvents = (teamA: Team, teamB: Team): string[] => {
  const events: string[] = [];
  
  // Pre-match
  events.push(`The teams walk out onto the pitch for this African Nations League clash`);
  events.push(`National anthems play as ${teamA.country} and ${teamB.country} prepare for battle`);
  
  // First half events
  for (let minute = 1; minute <= 45; minute++) {
    if (minute === 1) events.push("1': The referee blows the whistle and we're underway!");
    
    // Chance of various events
    if (Math.random() < 0.15) {
      const eventTypes = [
        `${minute}': Great passing movement from ${Math.random() > 0.5 ? teamA.country : teamB.country}`,
        `${minute}': Dangerous cross into the box, but the defense clears`,
        `${minute}': Long range effort goes just wide of the post`,
        `${minute}': Tactical foul stops a promising counter-attack`,
        `${minute}': Corner kick awarded after a deflected shot`,
        `${minute}': Brilliant save from the goalkeeper!`
      ];
      events.push(eventTypes[Math.floor(Math.random() * eventTypes.length)]);
    }
  }
  
  events.push("45+1': The referee blows for halftime");
  events.push("Halftime analysis: Both teams looking for openings in a tight contest");
  
  // Second half events
  for (let minute = 46; minute <= 90; minute++) {
    if (minute === 46) events.push("46': Second half begins!");
    
    // Increased chance of events in second half
    if (Math.random() < 0.18) {
      const eventTypes = [
        `${minute}': Substitution being prepared on the sidelines`,
        `${minute}': Yellow card shown for a reckless challenge`,
        `${minute}': Free kick in a dangerous position`,
        `${minute}': Header goes just over the crossbar`,
        `${minute}': Counter-attack leads to a shooting opportunity`,
        `${minute}': The crowd is on their feet as the action intensifies`
      ];
      events.push(eventTypes[Math.floor(Math.random() * eventTypes.length)]);
    }
  }
  
  events.push("90+3': The final whistle blows!");
  
  return events;
};

// Extract score and goal scorers from match events
const extractMatchResults = (events: string[], teamA: Team, teamB: Team): { 
  scoreA: number; scoreB: number; goalScorers: GoalScorer[] 
} => {
  // Generate realistic score based on team ratings
  const baseScoreA = Math.floor(teamA.averageRating / 30 + Math.random() * 2);
  const baseScoreB = Math.floor(teamB.averageRating / 30 + Math.random() * 2);
  
  const scoreA = Math.max(0, Math.min(5, baseScoreA)); // Cap at 5 goals
  const scoreB = Math.max(0, Math.min(5, baseScoreB));

  const goalScorers: GoalScorer[] = [];
  
  // Generate goals with realistic minute distribution
  const generateTeamGoals = (team: Team, goals: number) => {
    const attackingPlayers = team.squad.filter(p => 
      p.naturalPosition === 'AT' || p.naturalPosition === 'MD'
    );
    
    for (let i = 0; i < goals; i++) {
      const scorer = attackingPlayers[Math.floor(Math.random() * attackingPlayers.length)];
      // Goals are more likely in certain minute ranges
      const minuteRanges = [
        { min: 15, max: 40, weight: 0.3 },  // First half
        { min: 50, max: 70, weight: 0.4 },  // Early second half  
        { min: 75, max: 88, weight: 0.3 }   // Late drama
      ];
      const range = minuteRanges[Math.floor(Math.random() * minuteRanges.length)];
      const minute = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      
      goalScorers.push({
        playerId: scorer.id,
        playerName: scorer.name,
        teamId: team.id,
        teamName: team.country,
        minute
      });
    }
  };

  generateTeamGoals(teamA, scoreA);
  generateTeamGoals(teamB, scoreB);
  goalScorers.sort((a, b) => a.minute - b.minute);

  return { scoreA, scoreB, goalScorers };
};

//playMatch function that accepts matchType
export const playMatch = async (matchId: string, matchType: 'played' | 'simulated' = 'simulated'): Promise<void> => {
  console.log(`\n=== ${matchType === 'played' ? 'PLAYING' : 'SIMULATING'} match: ${matchId} ===`);
  
  const matchDoc = await db.collection('matches').doc(matchId).get();
  const match = matchDoc.data() as Match;

  if (!match) {
    console.error(`Match ${matchId} not found!`);
    return;
  }

  if (match.status === 'completed') {
    console.log(`Match ${matchId} is already completed`);
    return;
  }

  console.log(`Match: ${match.teamAName} vs ${match.teamBName}`);

  const teamADoc = await db.collection('teams').doc(match.teamAId).get();
  const teamBDoc = await db.collection('teams').doc(match.teamBId).get();

  if (!teamADoc.exists || !teamBDoc.exists) {
    console.error('One or both teams not found!');
    return;
  }

  const teamA = teamADoc.data() as Team;
  const teamB = teamBDoc.data() as Team;

  // Ensure teams have IDs from the document
  teamA.id = teamADoc.id;
  teamB.id = teamBDoc.id;

  console.log(`Teams loaded: ${teamA.country} (${teamA.averageRating}) vs ${teamB.country} (${teamB.averageRating})`);

  // CHOOSE THE RIGHT FUNCTION BASED ON MATCH TYPE
  const result = matchType === 'played' 
    ? await playMatchWithAI(teamA, teamB)
    : await simulateMatch(teamA, teamB);

  // Filter out any undefined goal scorers
  const safeGoalScorers = result.goalScorers.filter(gs => 
    gs && gs.playerId && gs.playerName && gs.teamId && gs.teamName
  );

  console.log(`Safe goal scorers count: ${safeGoalScorers.length}`);

  // Update the match with results
  await db.collection('matches').doc(matchId).update({
    scoreA: result.scoreA,
    scoreB: result.scoreB,
    goalScorers: safeGoalScorers,
    commentary: result.commentary,
    matchType: matchType,
    status: 'completed',
    completedAt: new Date()
  });

  console.log(`Match ${matchId} updated as ${matchType} match`);

  await updateTournamentProgress(matchId);

  // Update Global Goal Leaderboard - TOURNAMENT SPECIFIC
  let updatedScorers = 0;
  
  for (const scorer of safeGoalScorers) {
    try {
      // Include tournamentId in the document ID or as a field
      const tournamentId = match.tournamentId; // Get from the match

      if (!tournamentId) {
          console.error('No tournamentId found for match:', matchId);
          continue;
      }
      const leaderboardId = `${tournamentId}_${scorer.playerId}`;
      
      const ref = db.collection('goalLeaders').doc(leaderboardId);
      
      const currentDoc = await ref.get();
      
      if (currentDoc.exists) {
        const currentData = currentDoc.data();
        await ref.update({
          goals: (currentData?.goals || 0) + 1,
          teamName: currentData?.teamName || scorer.teamName,
          teamId: scorer.teamId,
          playerName: scorer.playerName,
          tournamentId: tournamentId, // Store tournament ID
          lastUpdated: new Date()
        });
      } else {
        await ref.set({
          playerId: scorer.playerId,
          playerName: scorer.playerName,
          teamId: scorer.teamId,
          teamName: scorer.teamName,
          tournamentId: tournamentId, // Store tournament ID
          goals: 1,
          lastUpdated: new Date()
        });
      }
      updatedScorers++;
    } catch (error) {
      console.error(`Error updating goal leaderboard for ${scorer.playerName}:`, error);
    }
  }

  console.log(`Goal leaderboard updated for ${updatedScorers} scorers in tournament ${match.tournamentId}`);


  // Send emails to both teams (your existing code)
  try {
    const userDocA = await db.collection('users').doc(teamA.representativeId).get();
    const userDocB = await db.collection('users').doc(teamB.representativeId).get();

    const userA = userDocA.data();
    const userB = userDocB.data();

    if (userA?.email) {
      const resultType = result.scoreA > result.scoreB ? 'won' : result.scoreA < result.scoreB ? 'lost' : 'drew';
      const goalScorerNames = safeGoalScorers
        .filter(gs => gs.teamId === teamA.id)
        .map(gs => `${gs.playerName} (${gs.minute}')`);
      
      await sendMatchResultEmail(
        userA.email,
        teamA.country,
        teamB.country,
        `${result.scoreA}-${result.scoreB}`,
        resultType,
        goalScorerNames
      );
    }

    if (userB?.email) {
      const resultType = result.scoreB > result.scoreA ? 'won' : result.scoreB < result.scoreA ? 'lost' : 'drew';
      const goalScorerNames = safeGoalScorers
        .filter(gs => gs.teamId === teamB.id)
        .map(gs => `${gs.playerName} (${gs.minute}')`);
      
      await sendMatchResultEmail(
        userB.email,
        teamB.country,
        teamA.country,
        `${result.scoreB}-${result.scoreA}`,
        resultType,
        goalScorerNames
      );
    }
  } catch (emailError) {
    console.error('Error sending emails:', emailError);
  }

  console.log(`=== Match ${matchId} completed as ${matchType} ===\n`);
};