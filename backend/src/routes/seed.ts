// backend/src/routes/seed.ts
import express from 'express';
import { seedDemoData } from '../scripts/seedData';

const router = express.Router();

// Seed data endpoint
router.post('/seed-data', async (req, res) => {
  try {
    console.log('Admin requested seed data generation...');
    
    await seedDemoData();
    
    res.json({ 
      success: true, 
      message: 'Demo teams created successfully! You can now register the 8th team and start a tournament.' 
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create demo teams' 
    });
  }
});

export default router;