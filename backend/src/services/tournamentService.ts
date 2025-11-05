// backend/src/services/tournamentService.ts
import { db } from '../config/firebase';

export const resetTournamentGoalLeaderboard = async (tournamentId: string) => {
  try {
    console.log(`Resetting goal leaderboard for tournament: ${tournamentId}`);
    
    if (!tournamentId) {
      console.error('No tournament ID provided for leaderboard reset');
      return { success: false, error: 'No tournament ID provided' };
    }

    // Delete all goal leader entries for this tournament
    const goalLeadersSnapshot = await db.collection('goalLeaders')
      .where('tournamentId', '==', tournamentId)
      .get();

    console.log(`Found ${goalLeadersSnapshot.size} goal leader entries to delete`);

    if (goalLeadersSnapshot.size === 0) {
      console.log('No goal leader entries found to delete');
      return { success: true, deletedCount: 0 };
    }

    const batch = db.batch();
    goalLeadersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Successfully deleted ${goalLeadersSnapshot.size} goal leader entries for tournament ${tournamentId}`);
    
    return { success: true, deletedCount: goalLeadersSnapshot.size };
  } catch (error) {
    console.error('Error resetting goal leaderboard:', error);
    throw error;
  }
};
