export interface User {
  id: string;
  email: string;
  password: string; // Add password field
  role: 'admin' | 'federation' | 'visitor';
  federationId?: string; // For representatives
  createdAt: Date;
}

// Add session management
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Player {
  id: string;
  name: string;
  naturalPosition: 'GK' | 'DF' | 'MD' | 'AT';
  ratings: {
    GK: number;
    DF: number;
    MD: number;
    AT: number;
  };
  isCaptain: boolean;
}

export interface Team {
  id: string;
  country: string;
  manager: string;
  representativeId: string;
  squad: Player[];
  averageRating: number;
  createdAt: Date;
}

export interface GoalScorer {
  playerId: string;
  playerName: string;
  teamId: string;
  minute: number;
  teamName: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: 'quarterfinal' | 'semifinal' | 'final';
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  goalScorers: GoalScorer[];
  commentary: string[];
  status: 'scheduled' | 'live' | 'completed';
  matchType: 'played' | 'simulated';
  createdAt: Date;
}

export interface Tournament {
  id: string;
  name: string;
  teams: string[];
  matches: string[];
  currentRound: 'quarterfinal' | 'semifinal' | 'final' | 'completed';
  winner?: string;
  isActive: boolean;
  createdAt: Date;
}