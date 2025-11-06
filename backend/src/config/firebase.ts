import * as admin from 'firebase-admin';

// For production (Render) - use environment variable
// For development - use serviceAccountKey.json file
let serviceAccount;

if (process.env.NODE_ENV === 'production') {
  // Production: Parse from environment variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
    throw new Error('Firebase service account configuration is invalid');
  }
} else {
  // Development: Use local file
  try {
    serviceAccount = require('../serviceAccountKey.json');
  } catch (error) {
    console.error('Error loading serviceAccountKey.json:', error);
    console.log('Falling back to environment variable for development');
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    } catch (e) {
      console.error('No valid Firebase configuration found');
    }
  }
}

// Only initialize if we have valid service account
if (serviceAccount && serviceAccount.project_id) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  console.log('Firebase Admin initialized successfully');
} else {
  console.error('Firebase service account configuration is missing or invalid');
  // Don't throw error here to allow the app to start (for testing)
}

export const db = admin.firestore();
export const auth = admin.auth();