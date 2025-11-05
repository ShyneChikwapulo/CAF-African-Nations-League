import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/firebase';

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  });
};

// Register endpoint (for representatives only)
router.post('/register', async (req, res) => {
  try {
    const { email, password, country, manager, federationName } = req.body;

    // Check if user already exists
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with representative role
    const user = {
      email,
      password: hashedPassword,
      role: 'representative',
      country,
      manager,
      federationName,
      createdAt: new Date()
    };

    const userRef = await db.collection('users').add(user);
    
    // Create federation document
    const federation = {
      name: federationName,
      country,
      manager,
      representativeId: userRef.id,
      createdAt: new Date()
    };

    const federationRef = await db.collection('federations').add(federation);

    // Update user with federation ID
    await db.collection('users').doc(userRef.id).update({
      federationId: federationRef.id
    });

    // Generate token
    const token = generateToken(userRef.id, 'representative');
    
    res.json({ 
      id: userRef.id,
      token,
      role: 'representative',
      email,
      federationId: federationRef.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(userDoc.id, user.role);
    
    res.json({
      id: userDoc.id,
      token,
      role: user.role,
      email: user.email,
      federationId: user.federationId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint (optional - client can just remove token)
router.post('/logout', async (req, res) => {
  
  res.json({ message: 'Logged out successfully' });
});

// Get current user endpoint
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const userDoc = await db.collection('users').doc(decoded.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userDoc.data();
    
    
    if (!user) {
      return res.status(404).json({ error: 'User data not found' });
    }

    res.json({
      id: userDoc.id,
      role: user.role,
      email: user.email,
      federationId: user.federationId
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;