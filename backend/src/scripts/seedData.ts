// backend/src/scripts/seedData.ts - Update to pass country
import { db } from '../config/firebase';
import { generateSquad, calculateTeamRating } from '../services/playerService';

const demoTeams = [
  { country: 'Nigeria', manager: 'José Peseiro' },
  { country: 'Egypt', manager: 'Rui Vitória' },
  { country: 'Senegal', manager: 'Aliou Cissé' },
  { country: 'Morocco', manager: 'Walid Regragui' },
  { country: 'Ghana', manager: 'Chris Hughton' },
  { country: 'Ivory Coast', manager: 'Jean-Louis Gasset' },
  { country: 'Cameroon', manager: 'Rigobert Song' }
];

export const seedDemoData = async () => {
  console.log('Seeding demo data...');
  
  for (const teamData of demoTeams) {
    // Check if team already exists
    const existingTeam = await db.collection('teams')
      .where('country', '==', teamData.country)
      .get();
    
    if (existingTeam.empty) {
      // Generate squad WITH COUNTRY
      const squad = generateSquad(teamData.country); // PASS COUNTRY HERE
      const averageRating = calculateTeamRating(squad);
      
      const team = {
        ...teamData,
        squad,
        averageRating,
        representativeId: 'demo-user',
        createdAt: new Date()
      };
      
      await db.collection('teams').add(team);
      console.log(`Created team: ${teamData.country} with country-specific names`);
    }
  }
  
  console.log('Demo data seeding completed!');
};

// Run if this file is executed directly
if (require.main === module) {
  seedDemoData();
}